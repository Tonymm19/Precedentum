import uuid
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.db.models import Q


class UserManager(BaseUserManager):
    """Custom user manager that uses email as the unique identifier."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("The email address must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)


class UserRole(models.TextChoices):
     ADMIN = "admin", "Admin"
     LAWYER = "lawyer", "Lawyer"
     PARALEGAL = "paralegal", "Paralegal"
     GUEST = "guest", "Guest"


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=UserRole.choices)
    firm = models.CharField(max_length=255, blank=True)
    timezone = models.CharField(max_length=64, default="America/Chicago")
    mfa_enabled = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    objects = UserManager()

    class Meta:
        db_table = "users"
        ordering = ["full_name"]

    def __str__(self):
        return self.full_name


class UUIDModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class Court(UUIDModel):
    name = models.CharField(max_length=255)
    district = models.CharField(max_length=255, blank=True)
    division = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    timezone = models.CharField(max_length=64)
    website_url = models.URLField(blank=True)

    class Meta:
        db_table = "courts"
        ordering = ["name"]

    def __str__(self):
        return self.name


class HolidayCalendar(UUIDModel):
    name = models.CharField(max_length=255)
    jurisdiction = models.CharField(max_length=255, blank=True)
    timezone = models.CharField(max_length=64)
    source_url = models.URLField(blank=True)

    class Meta:
        db_table = "holiday_calendars"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Holiday(UUIDModel):
    calendar = models.ForeignKey(HolidayCalendar, on_delete=models.CASCADE, related_name="holidays")
    date = models.DateField()
    name = models.CharField(max_length=255)

    class Meta:
        db_table = "holidays"
        constraints = [
            models.UniqueConstraint(fields=["calendar", "date"], name="unique_holiday_per_calendar"),
        ]
        ordering = ["date"]

    def __str__(self):
        return f"{self.name} ({self.date:%Y-%m-%d})"


class Judge(UUIDModel):
    full_name = models.CharField(max_length=255)
    court = models.ForeignKey(Court, on_delete=models.SET_NULL, null=True, blank=True, related_name="judges")
    courtroom = models.CharField(max_length=255, blank=True)
    chambers_url = models.URLField(blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=50, blank=True)
    holiday_calendar = models.ForeignKey(HolidayCalendar, null=True, blank=True, on_delete=models.SET_NULL, related_name="assigned_judges")

    class Meta:
        db_table = "judges"
        ordering = ["full_name"]

    def __str__(self):
        return self.full_name


class JudgeAssociation(UUIDModel):
    primary_judge = models.ForeignKey(Judge, on_delete=models.CASCADE, related_name="associated_judges")
    associated_judge = models.ForeignKey(Judge, on_delete=models.CASCADE, related_name="primary_assignments")
    association_type = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = "judge_associations"
        constraints = [
            models.UniqueConstraint(fields=["primary_judge", "associated_judge"], name="unique_judge_association"),
        ]

    def __str__(self):
        return f"{self.primary_judge} → {self.associated_judge}"


class JudgeProcedure(UUIDModel):
    judge = models.ForeignKey(Judge, on_delete=models.CASCADE, related_name="procedures")
    title = models.CharField(max_length=255)
    version = models.CharField(max_length=64)
    effective_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    content_text = models.TextField(blank=True)
    filing_format = models.JSONField(null=True, blank=True)
    exhibit_labeling = models.JSONField(null=True, blank=True)
    motion_practice = models.JSONField(null=True, blank=True)
    filing_cutoff_time = models.TimeField(null=True, blank=True)
    hearing_windows = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "judge_procedures"
        ordering = ["judge", "title"]

    def __str__(self):
        return f"{self.judge} – {self.title} ({self.version})"


class CaseStatus(models.TextChoices):
    OPEN = "open", "Open"
    STAYED = "stayed", "Stayed"
    CLOSED = "closed", "Closed"
    APPEAL = "appeal", "Appeal"
    OTHER = "other", "Other"


class Case(UUIDModel):
    internal_case_id = models.CharField(max_length=64, unique=True)
    case_number = models.CharField(max_length=128, blank=True)
    caption = models.CharField(max_length=512)
    practice_area = models.CharField(max_length=255, blank=True)
    court = models.ForeignKey(Court, on_delete=models.SET_NULL, null=True, blank=True, related_name="cases")
    filing_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=CaseStatus.choices, default=CaseStatus.OPEN)
    stage = models.CharField(max_length=128, blank=True)
    lead_attorney = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="lead_cases")
    confidentiality_level = models.CharField(max_length=128, blank=True)
    legal_hold = models.BooleanField(default=False)
    timezone = models.CharField(max_length=64)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "cases"
        ordering = ["-filing_date", "caption"]
        indexes = [
            models.Index(fields=["case_number"], name="idx_case_case_number"),
            models.Index(fields=["court", "status"], name="idx_case_court_status"),
        ]

    def __str__(self):
        return self.caption


class CaseRelationship(UUIDModel):
    from_case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="related_cases")
    to_case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="related_to")
    relation_type = models.CharField(max_length=64, blank=True)

    class Meta:
        db_table = "case_relationships"
        constraints = [
            models.UniqueConstraint(fields=["from_case", "to_case"], name="unique_case_relationship"),
        ]

    def __str__(self):
        return f"{self.from_case} ⇔ {self.to_case}"


class CaseTeamRole(models.TextChoices):
    OWNER = "owner", "Owner"
    CONTRIBUTOR = "contributor", "Contributor"
    REVIEWER = "reviewer", "Reviewer"


class CaseTeam(UUIDModel):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="team_members")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="case_memberships")
    role = models.CharField(max_length=32, choices=CaseTeamRole.choices)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "case_team"
        constraints = [
            models.UniqueConstraint(fields=["case", "user"], name="unique_case_team_member"),
        ]

    def __str__(self):
        return f"{self.case}: {self.user} ({self.role})"


class ContactType(models.TextChoices):
    PERSON = "person", "Person"
    ORGANIZATION = "organization", "Organization"


class Contact(UUIDModel):
    type = models.CharField(max_length=20, choices=ContactType.choices)
    first_name = models.CharField(max_length=255, blank=True)
    last_name = models.CharField(max_length=255, blank=True)
    org_name = models.CharField(max_length=255, blank=True)
    bar_number = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.JSONField(null=True, blank=True)
    preferred_contact_method = models.CharField(max_length=50, blank=True)
    availability = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = "contacts"
        ordering = ["org_name", "last_name", "first_name"]

    def __str__(self):
        if self.type == ContactType.ORGANIZATION:
            return self.org_name
        return f"{self.first_name} {self.last_name}".strip()


class ContactAddress(UUIDModel):
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name="service_addresses")
    label = models.CharField(max_length=100)
    address = models.JSONField()
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = "contact_addresses"
        constraints = [
            models.UniqueConstraint(fields=["contact", "label"], name="unique_contact_address_label"),
        ]

    def __str__(self):
        return f"{self.contact} – {self.label}"


class CaseContactRole(models.TextChoices):
    OPPOSING_COUNSEL = "opposing_counsel", "Opposing Counsel"
    CLIENT = "client", "Client"
    EXPERT = "expert", "Expert"
    VENDOR = "vendor", "Vendor"
    REPORTER = "reporter", "Reporter"
    PLAINTIFF = "plaintiff", "Plaintiff"
    DEFENDANT = "defendant", "Defendant"
    OTHER = "other", "Other"


class CaseContact(UUIDModel):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="case_contacts")
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name="case_roles")
    role = models.CharField(max_length=32, choices=CaseContactRole.choices)

    class Meta:
        db_table = "case_contacts"
        constraints = [
            models.UniqueConstraint(fields=["case", "contact", "role"], name="unique_case_contact_role"),
        ]

    def __str__(self):
        return f"{self.case} – {self.contact} ({self.role})"


class CaseTag(UUIDModel):
    name = models.CharField(max_length=64, unique=True)

    class Meta:
        db_table = "case_tags"
        ordering = ["name"]

    def __str__(self):
        return self.name


class CaseTagAssignment(UUIDModel):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="tag_assignments")
    tag = models.ForeignKey(CaseTag, on_delete=models.CASCADE, related_name="cases")

    class Meta:
        db_table = "case_tag_assignments"
        constraints = [
            models.UniqueConstraint(fields=["case", "tag"], name="unique_case_tag"),
        ]

    def __str__(self):
        return f"{self.case} – {self.tag}"


class CaseNote(UUIDModel):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="notes")
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="case_notes")
    body = models.TextField()
    visibility = models.CharField(max_length=32, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "case_notes"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Note on {self.case}"


class CasePermission(UUIDModel):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="permissions")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="case_permissions")
    can_view = models.BooleanField(default=True)
    can_edit = models.BooleanField(default=False)
    can_manage_deadlines = models.BooleanField(default=False)
    can_manage_filings = models.BooleanField(default=False)

    class Meta:
        db_table = "case_permissions"
        constraints = [
            models.UniqueConstraint(fields=["case", "user"], name="unique_case_permission"),
        ]

    def __str__(self):
        return f"Permissions for {self.user} on {self.case}"


class DocumentSource(models.TextChoices):
    UPLOAD = "upload", "Upload"
    PACER = "pacer", "PACER"
    WEB = "web", "Web"
    JUDGE_PROCEDURE = "judge_procedure", "Judge Procedure"
    RULE = "rule", "Rule"


class OcrStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    COMPLETE = "complete", "Complete"
    FAILED = "failed", "Failed"


class Document(UUIDModel):
    case = models.ForeignKey(Case, on_delete=models.SET_NULL, null=True, blank=True, related_name="documents")
    title = models.CharField(max_length=255, blank=True)
    source = models.CharField(max_length=32, choices=DocumentSource.choices)
    url = models.URLField(blank=True)
    file_hash = models.CharField(max_length=128, blank=True)
    mime_type = models.CharField(max_length=128, blank=True)
    page_count = models.PositiveIntegerField(null=True, blank=True)
    ocr_status = models.CharField(max_length=16, choices=OcrStatus.choices, default=OcrStatus.PENDING)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="uploaded_documents")
    metadata = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = "documents"
        ordering = ["-uploaded_at"]

    def __str__(self):
        return self.title or f"Document {self.pk}"


class DocChunk(UUIDModel):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="chunks")
    chunk_index = models.PositiveIntegerField()
    start_offset = models.PositiveIntegerField(null=True, blank=True)
    end_offset = models.PositiveIntegerField(null=True, blank=True)
    heading = models.CharField(max_length=255, blank=True)
    content = models.TextField(blank=True)
    embedding_id = models.UUIDField(null=True, blank=True)
    model_version = models.CharField(max_length=128, blank=True)

    class Meta:
        db_table = "doc_chunks"
        constraints = [
            models.UniqueConstraint(fields=["document", "chunk_index"], name="unique_chunk_per_document"),
        ]
        ordering = ["document", "chunk_index"]

    def __str__(self):
        return f"Chunk {self.chunk_index} of {self.document}"


class RuleSourceType(models.TextChoices):
    FRCP = "FRCP", "FRCP"
    LOCAL_RULE = "LocalRule", "Local Rule"
    JUDGE_PROCEDURE = "JudgeProcedure", "Judge Procedure"
    ECF_MANUAL = "ECFManual", "ECF Manual"
    STANDING_ORDER = "StandingOrder", "Standing Order"


class Rule(UUIDModel):
    source_type = models.CharField(max_length=32, choices=RuleSourceType.choices)
    citation = models.CharField(max_length=255, blank=True)
    jurisdiction = models.CharField(max_length=255, blank=True)
    version = models.CharField(max_length=64, blank=True)
    effective_date = models.DateField(null=True, blank=True)
    superseded_by = models.ForeignKey("self", on_delete=models.SET_NULL, null=True, blank=True, related_name="supersedes")
    text = models.TextField(blank=True)
    url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "rules"
        ordering = ["jurisdiction", "citation"]

    def __str__(self):
        return self.citation or f"Rule {self.pk}"


class RuleCrossRef(UUIDModel):
    from_rule = models.ForeignKey(Rule, on_delete=models.CASCADE, related_name="crossref_from")
    to_rule = models.ForeignKey(Rule, on_delete=models.CASCADE, related_name="crossref_to")

    class Meta:
        db_table = "rule_crossrefs"
        constraints = [
            models.UniqueConstraint(fields=["from_rule", "to_rule"], name="unique_rule_crossref"),
        ]

    def __str__(self):
        return f"{self.from_rule} → {self.to_rule}"


class DeadlineTriggerType(models.TextChoices):
    RULE = "rule", "Rule"
    COURT_ORDER = "court_order", "Court Order"
    USER = "user", "User"


class DeadlineBasis(models.TextChoices):
    CALENDAR_DAYS = "calendar_days", "Calendar Days"
    BUSINESS_DAYS = "business_days", "Business Days"


class DeadlineStatus(models.TextChoices):
    OPEN = "open", "Open"
    SNOOZED = "snoozed", "Snoozed"
    DONE = "done", "Done"
    MISSED = "missed", "Missed"


class Deadline(UUIDModel):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="deadlines")
    trigger_type = models.CharField(max_length=32, choices=DeadlineTriggerType.choices)
    trigger_source_type = models.CharField(max_length=32, blank=True)
    trigger_source_id = models.UUIDField(null=True, blank=True)
    basis = models.CharField(max_length=32, choices=DeadlineBasis.choices, default=DeadlineBasis.CALENDAR_DAYS)
    holiday_calendar = models.ForeignKey(HolidayCalendar, on_delete=models.SET_NULL, null=True, blank=True, related_name="deadlines")
    due_at = models.DateTimeField()
    timezone = models.CharField(max_length=64)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="owned_deadlines")
    priority = models.PositiveSmallIntegerField(default=3, validators=[MinValueValidator(1), MaxValueValidator(5)])
    status = models.CharField(max_length=16, choices=DeadlineStatus.choices, default=DeadlineStatus.OPEN)
    snooze_until = models.DateTimeField(null=True, blank=True)
    extension_notes = models.TextField(blank=True)
    outcome = models.TextField(blank=True)
    computation_rationale = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_deadlines")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_deadlines")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "deadlines"
        indexes = [
            models.Index(fields=["case", "due_at"], name="idx_deadline_case_due"),
        ]
        ordering = ["due_at"]

    def __str__(self):
        return f"Deadline for {self.case} @ {self.due_at:%Y-%m-%d}"


class ReminderChannel(models.TextChoices):
    IN_APP = "in_app", "In App"
    EMAIL = "email", "Email"
    SMS = "sms", "SMS"
    PUSH = "push", "Push"


class DeadlineReminder(UUIDModel):
    deadline = models.ForeignKey(Deadline, on_delete=models.CASCADE, related_name="reminders")
    notify_at = models.DateTimeField()
    channel = models.CharField(max_length=16, choices=ReminderChannel.choices)
    sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "deadline_reminders"
        indexes = [
            models.Index(fields=["notify_at", "sent"], name="idx_deadline_reminder_status"),
        ]
        ordering = ["notify_at"]

    def __str__(self):
        return f"Reminder for {self.deadline}"


class DeadlineDependency(UUIDModel):
    predecessor = models.ForeignKey(Deadline, on_delete=models.CASCADE, related_name="successor_links")
    successor = models.ForeignKey(Deadline, on_delete=models.CASCADE, related_name="predecessor_links")
    dependency_type = models.CharField(max_length=32, blank=True)

    class Meta:
        db_table = "deadline_dependencies"
        constraints = [
            models.UniqueConstraint(fields=["predecessor", "successor"], name="unique_deadline_dependency"),
        ]

    def __str__(self):
        return f"{self.predecessor} → {self.successor}"


class DocketEntry(UUIDModel):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="docket_entries")
    entry_no = models.IntegerField(null=True, blank=True)
    entered_at = models.DateTimeField(null=True, blank=True)
    entry_type = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    ecf_link = models.URLField(blank=True)
    pdf_document = models.ForeignKey(Document, on_delete=models.SET_NULL, null=True, blank=True, related_name="docket_references")

    class Meta:
        db_table = "docket_entries"
        indexes = [
            models.Index(fields=["case"], name="idx_docket_case"),
        ]
        ordering = ["case", "entry_no"]

    def __str__(self):
        return f"Docket #{self.entry_no or '?'} for {self.case}"


class FilingPackageType(models.TextChoices):
    SINGLE_PDF = "single_pdf", "Single PDF"
    MULTI_PDF = "multi_pdf", "Multiple PDF"


class Filing(UUIDModel):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="filings")
    filing_type = models.CharField(max_length=255, blank=True)
    ecf_category = models.CharField(max_length=255, blank=True)
    packaged_as = models.CharField(max_length=20, choices=FilingPackageType.choices, blank=True)
    served_at = models.DateTimeField(null=True, blank=True)
    service_method = models.CharField(max_length=128, blank=True)
    notes = models.TextField(blank=True)
    primary_document = models.ForeignKey(Document, on_delete=models.SET_NULL, null=True, blank=True, related_name="primary_for_filings")

    class Meta:
        db_table = "filings"
        ordering = ["-served_at"]

    def __str__(self):
        return f"Filing for {self.case}"


class FilingExhibit(UUIDModel):
    filing = models.ForeignKey(Filing, on_delete=models.CASCADE, related_name="exhibits")
    label = models.CharField(max_length=64)
    document = models.ForeignKey(Document, on_delete=models.SET_NULL, null=True, blank=True, related_name="exhibit_of")

    class Meta:
        db_table = "filing_exhibits"
        constraints = [
            models.UniqueConstraint(fields=["filing", "label"], name="unique_filing_exhibit_label"),
        ]

    def __str__(self):
        return f"{self.label} for {self.filing}"


class FilingServiceContact(UUIDModel):
    filing = models.ForeignKey(Filing, on_delete=models.CASCADE, related_name="service_contacts")
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name="service_filings")

    class Meta:
        db_table = "service_list"
        constraints = [
            models.UniqueConstraint(fields=["filing", "contact"], name="unique_service_contact"),
        ]

    def __str__(self):
        return f"Service contact {self.contact} for {self.filing}"


class Hearing(UUIDModel):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="hearings")
    hearing_type = models.CharField(max_length=255, blank=True)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    virtual_link = models.URLField(blank=True)
    requirements = models.TextField(blank=True)
    outcome = models.TextField(blank=True)

    class Meta:
        db_table = "hearings"
        indexes = [
            models.Index(fields=["case", "starts_at"], name="idx_hearing_case_start"),
        ]
        ordering = ["starts_at"]

    def __str__(self):
        return f"{self.hearing_type or 'Hearing'} for {self.case}"


class HearingFollowUp(UUIDModel):
    hearing = models.ForeignKey(Hearing, on_delete=models.CASCADE, related_name="followups")
    deadline = models.ForeignKey(Deadline, on_delete=models.CASCADE, related_name="hearing_followups")

    class Meta:
        db_table = "hearing_followups"
        constraints = [
            models.UniqueConstraint(fields=["hearing", "deadline"], name="unique_hearing_followup"),
        ]

    def __str__(self):
        return f"Follow-up {self.deadline} for {self.hearing}"


class AlertSeverity(models.TextChoices):
    INFO = "info", "Info"
    WARN = "warn", "Warn"
    CRITICAL = "critical", "Critical"


class Alert(UUIDModel):
    case = models.ForeignKey(Case, on_delete=models.SET_NULL, null=True, blank=True, related_name="alerts")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="alerts")
    type = models.CharField(max_length=64, blank=True)
    severity = models.CharField(max_length=16, choices=AlertSeverity.choices, default=AlertSeverity.INFO)
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "alerts"
        indexes = [
            models.Index(fields=["user", "created_at"], name="idx_alert_user_created"),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class CalendarProvider(models.TextChoices):
    GOOGLE = "google", "Google"
    M365 = "m365", "Microsoft 365"
    ICAL = "ical", "iCal"


class CalendarEvent(UUIDModel):
    case = models.ForeignKey(Case, on_delete=models.SET_NULL, null=True, blank=True, related_name="calendar_events")
    external_provider = models.CharField(max_length=16, choices=CalendarProvider.choices, blank=True)
    external_event_id = models.CharField(max_length=255, blank=True)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField(null=True, blank=True)
    sync_state = models.CharField(max_length=64, blank=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "calendar_events"
        indexes = [
            models.Index(fields=["case", "starts_at"], name="idx_calendar_case_start"),
        ]
        ordering = ["starts_at"]

    def __str__(self):
        return f"Calendar event for {self.case or 'general'}"


class SubscriptionType(models.TextChoices):
    DEADLINES = "deadlines", "Deadlines"
    DOCKET = "docket", "Docket"
    HEARINGS = "hearings", "Hearings"
    ALL = "all", "All"


class UserNotificationSubscription(UUIDModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notification_subscriptions")
    case = models.ForeignKey(Case, on_delete=models.CASCADE, null=True, blank=True, related_name="notification_subscriptions")
    type = models.CharField(max_length=32, choices=SubscriptionType.choices)

    class Meta:
        db_table = "user_notification_subscriptions"
        constraints = [
            models.UniqueConstraint(fields=["user", "case", "type"], name="unique_subscription_per_case"),
            models.UniqueConstraint(fields=["user", "type"], condition=Q(case__isnull=True), name="unique_global_subscription"),
        ]

    def __str__(self):
        scope = self.case.caption if self.case else "global"
        return f"{self.user} – {self.type} ({scope})"


class NotificationChannel(models.TextChoices):
    IN_APP = "in_app", "In App"
    EMAIL = "email", "Email"
    SMS = "sms", "SMS"
    PUSH = "push", "Push"


class NotificationStatus(models.TextChoices):
    QUEUED = "queued", "Queued"
    SENT = "sent", "Sent"
    FAILED = "failed", "Failed"


class NotificationLog(UUIDModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notification_logs")
    channel = models.CharField(max_length=16, choices=NotificationChannel.choices)
    payload = models.JSONField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=NotificationStatus.choices, default=NotificationStatus.QUEUED)

    class Meta:
        db_table = "notifications_log"
        ordering = ["-delivered_at"]

    def __str__(self):
        return f"Notification via {self.channel} to {self.user}"


class AuditAction(models.TextChoices):
    CREATE = "create", "Create"
    UPDATE = "update", "Update"
    DELETE = "delete", "Delete"
    COMPUTE = "compute", "Compute"


class AuditLog(UUIDModel):
    actor_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_events")
    entity_table = models.CharField(max_length=255)
    entity_id = models.UUIDField()
    action = models.CharField(max_length=32, choices=AuditAction.choices)
    before = models.JSONField(null=True, blank=True)
    after = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "audit_log"
        indexes = [
            models.Index(fields=["entity_table", "entity_id"], name="idx_audit_entity"),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} {self.entity_table}:{self.entity_id}"


class RetrievalRun(UUIDModel):
    case = models.ForeignKey(Case, on_delete=models.SET_NULL, null=True, blank=True, related_name="retrieval_runs")
    query = models.TextField()
    top_k = models.PositiveIntegerField(default=0)
    scores = models.JSONField(null=True, blank=True)
    selected_spans = models.JSONField(null=True, blank=True)
    model_version = models.CharField(max_length=128, blank=True)
    run_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="retrieval_runs")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "retrieval_runs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Retrieval run for {self.case or 'global'}"
