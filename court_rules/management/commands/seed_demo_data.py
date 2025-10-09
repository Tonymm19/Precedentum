import random
from datetime import datetime, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from court_rules.models import (
    Case,
    CaseStatus,
    Court,
    Deadline,
    DeadlineBasis,
    DeadlineStatus,
    DeadlineTriggerType,
    HolidayCalendar,
    Judge,
    JudgeProcedure,
    Rule,
    RuleSourceType,
    User,
    UserRole,
)


class Command(BaseCommand):
    help = "Seed a small set of demo data for local development."

    def handle(self, *args, **options):
        with transaction.atomic():
            firm_user, _ = User.objects.get_or_create(
                email="demo.lawyer@example.com",
                defaults={
                    "full_name": "Demo Lawyer",
                    "role": UserRole.LAWYER,
                    "timezone": "America/Chicago",
                },
            )
            if not firm_user.has_usable_password():
                firm_user.set_password("changeme123")
                firm_user.save(update_fields=["password"])

            court, _ = Court.objects.get_or_create(
                name="United States District Court for the Northern District of Illinois",
                defaults={
                    "district": "Northern District of Illinois",
                    "division": "Eastern Division",
                    "location": "Chicago, IL",
                    "timezone": "America/Chicago",
                    "website_url": "https://www.ilnd.uscourts.gov",
                },
            )

            holiday_calendar, _ = HolidayCalendar.objects.get_or_create(
                name="Federal Holidays",
                defaults={
                    "jurisdiction": "Federal",
                    "timezone": "America/Chicago",
                    "source_url": "https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/",
                },
            )

            judge, _ = Judge.objects.get_or_create(
                full_name="Hon. Rebecca R. Pallmeyer",
                defaults={
                    "court": court,
                    "courtroom": "Courtroom 2525",
                    "chambers_url": "https://www.ilnd.uscourts.gov/judges-put/pallmeyer.aspx",
                    "contact_email": "pallmeyer_chambers@ilnd.uscourts.gov",
                    "contact_phone": "312-435-7600",
                    "holiday_calendar": holiday_calendar,
                },
            )

            JudgeProcedure.objects.get_or_create(
                judge=judge,
                title="Standing Order on Motion Practice",
                version="2025.1",
                defaults={
                    "effective_date": datetime(2025, 1, 1).date(),
                    "content_text": "Motions must include a notice of presentment in compliance with Local Rule 5.3.",
                    "filing_format": {
                        "preferred_format": "single_pdf",
                        "page_limit": 25,
                    },
                },
            )

            demo_case, _ = Case.objects.get_or_create(
                internal_case_id="DCB-2025-0001",
                defaults={
                    "case_number": "1:25-cv-00001",
                    "caption": "TechCorp Inc. v. DataSystems LLC",
                    "practice_area": "Intellectual Property",
                    "court": court,
                    "filing_date": datetime(2025, 1, 15).date(),
                    "status": CaseStatus.OPEN,
                    "stage": "Discovery",
                    "lead_attorney": firm_user,
                    "confidentiality_level": "Confidential",
                    "legal_hold": True,
                    "timezone": "America/Chicago",
                },
            )

            rule, _ = Rule.objects.get_or_create(
                source_type=RuleSourceType.JUDGE_PROCEDURE,
                citation="Pallmeyer Standing Order 2025-1",
                defaults={
                    "jurisdiction": "N.D. Ill.",
                    "version": "2025-01",
                    "effective_date": datetime(2025, 1, 1).date(),
                    "text": "Standing order detailing motion briefing schedule and courtesy copies.",
                    "url": "https://www.ilnd.uscourts.gov/judges/pallmeyer",
                },
            )

            Deadline.objects.get_or_create(
                case=demo_case,
                trigger_type=DeadlineTriggerType.RULE,
                trigger_source_type="standing_order",
                trigger_source_id=rule.id,
                basis=DeadlineBasis.BUSINESS_DAYS,
                due_at=timezone.now() + timedelta(days=14),
                defaults={
                    "holiday_calendar": holiday_calendar,
                    "timezone": "America/Chicago",
                    "owner": firm_user,
                    "priority": random.choice([1, 2, 3]),
                    "status": DeadlineStatus.OPEN,
                    "computation_rationale": "Rule 7 briefing schedule (21 days).",
                    "created_by": firm_user,
                    "updated_by": firm_user,
                },
            )

            Deadline.objects.get_or_create(
                case=demo_case,
                trigger_type=DeadlineTriggerType.COURT_ORDER,
                trigger_source_type="docket_entry",
                trigger_source_id=None,
                basis=DeadlineBasis.CALENDAR_DAYS,
                due_at=timezone.now() + timedelta(days=3),
                defaults={
                    "holiday_calendar": holiday_calendar,
                    "timezone": "America/Chicago",
                    "owner": firm_user,
                    "priority": 1,
                    "status": DeadlineStatus.OPEN,
                    "computation_rationale": "Court-ordered status report due within three days.",
                    "created_by": firm_user,
                    "updated_by": firm_user,
                },
            )

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully."))
        self.stdout.write(self.style.WARNING("Login with demo.lawyer@example.com / changeme123"))
