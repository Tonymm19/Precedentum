from django.utils import timezone
from rest_framework import serializers

from court_rules.models import (
    Case,
    Deadline,
    DeadlineReminder,
    Judge,
    Rule,
    AuditLog,
    User,
)


class JudgeSerializer(serializers.ModelSerializer):
    court_name = serializers.SerializerMethodField()
    holiday_calendar_name = serializers.SerializerMethodField()

    class Meta:
        model = Judge
        fields = [
            'id',
            'full_name',
            'court',
            'court_name',
            'courtroom',
            'chambers_url',
            'contact_email',
            'contact_phone',
            'holiday_calendar',
            'holiday_calendar_name',
        ]
        read_only_fields = fields

    def get_court_name(self, obj):
        return obj.court.name if obj.court else None

    def get_holiday_calendar_name(self, obj):
        return obj.holiday_calendar.name if obj.holiday_calendar else None


class CaseSerializer(serializers.ModelSerializer):
    court_name = serializers.SerializerMethodField()
    lead_attorney_name = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = [
            'id',
            'internal_case_id',
            'case_number',
            'caption',
            'practice_area',
            'court',
            'court_name',
            'filing_date',
            'status',
            'stage',
            'lead_attorney',
            'lead_attorney_name',
            'confidentiality_level',
            'legal_hold',
            'timezone',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_court_name(self, obj):
        return obj.court.name if obj.court else None

    def get_lead_attorney_name(self, obj):
        return obj.lead_attorney.full_name if obj.lead_attorney else None


class DeadlineSerializer(serializers.ModelSerializer):
    case_caption = serializers.SerializerMethodField()
    owner_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    updated_by_name = serializers.SerializerMethodField()
    holiday_calendar_name = serializers.SerializerMethodField()
    pending_reminders = serializers.SerializerMethodField()

    class Meta:
        model = Deadline
        fields = [
            'id',
            'case',
            'case_caption',
            'trigger_type',
            'trigger_source_type',
            'trigger_source_id',
            'basis',
            'holiday_calendar',
            'holiday_calendar_name',
            'due_at',
            'timezone',
            'owner',
            'owner_name',
            'priority',
            'status',
            'snooze_until',
            'extension_notes',
            'outcome',
            'computation_rationale',
            'created_by',
            'created_by_name',
            'updated_by',
            'updated_by_name',
            'created_at',
            'updated_at',
            'pending_reminders',
        ]
        read_only_fields = [
            'id',
            'case',
            'case_caption',
            'holiday_calendar',
            'holiday_calendar_name',
            'owner',
            'owner_name',
            'priority',
            'computation_rationale',
            'created_by',
            'created_by_name',
            'updated_by',
            'updated_by_name',
            'created_at',
            'updated_at',
        ]

    def get_case_caption(self, obj):
        return obj.case.caption if obj.case else None

    def get_owner_name(self, obj):
        return obj.owner.full_name if obj.owner else None

    def get_created_by_name(self, obj):
        return obj.created_by.full_name if obj.created_by else None

    def get_updated_by_name(self, obj):
        return obj.updated_by.full_name if obj.updated_by else None

    def get_holiday_calendar_name(self, obj):
        return obj.holiday_calendar.name if obj.holiday_calendar else None

    def validate_snooze_until(self, value):
        if value and value <= timezone.now():
            raise serializers.ValidationError('Snooze until must be in the future.')
        return value

    def get_pending_reminders(self, obj):
        return obj.reminders.filter(sent=False).count()


class DeadlineReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeadlineReminder
        fields = [
            'id',
            'deadline',
            'notify_at',
            'channel',
            'sent',
            'sent_at',
        ]
        read_only_fields = ['id', 'sent', 'sent_at']

    def validate_notify_at(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError('notify_at must be in the future.')
        return value


class DeadlineCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deadline
        fields = [
            'id',
            'case',
            'trigger_type',
            'trigger_source_type',
            'trigger_source_id',
            'basis',
            'holiday_calendar',
            'due_at',
            'timezone',
            'owner',
            'priority',
            'status',
            'snooze_until',
            'extension_notes',
            'outcome',
            'computation_rationale',
        ]
        read_only_fields = ['id']

    def validate_due_at(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError('Due date must be in the future.')
        return value

    def validate(self, attrs):
        snooze_until = attrs.get('snooze_until')
        if snooze_until and snooze_until <= timezone.now():
            raise serializers.ValidationError({'snooze_until': 'Snooze until must be in the future.'})
        return attrs


class RuleSerializer(serializers.ModelSerializer):
    superseded_by_citation = serializers.SerializerMethodField()

    class Meta:
        model = Rule
        fields = [
            'id',
            'source_type',
            'citation',
            'jurisdiction',
            'version',
            'effective_date',
            'superseded_by',
            'superseded_by_citation',
            'text',
            'url',
            'created_at',
        ]
        read_only_fields = fields

    def get_superseded_by_citation(self, obj):
        return obj.superseded_by.citation if obj.superseded_by else None


class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'actor_user',
            'actor_name',
            'entity_table',
            'entity_id',
            'action',
            'before',
            'after',
            'created_at',
        ]
        read_only_fields = fields

    def get_actor_name(self, obj):
        if obj.actor_user:
            return obj.actor_user.full_name or obj.actor_user.email
        return None


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField()

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'role']
        read_only_fields = fields
