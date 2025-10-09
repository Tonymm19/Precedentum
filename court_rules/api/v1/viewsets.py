from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated

from court_rules.models import AuditAction, AuditLog, Case, Deadline, DeadlineReminder, Judge, Rule, User
from court_rules.services.audit import format_deadline_snapshot, record_audit_event
from court_rules.api.v1.serializers import (
    AuditLogSerializer,
    CaseSerializer,
    DeadlineCreateSerializer,
    DeadlineReminderSerializer,
    DeadlineSerializer,
    JudgeSerializer,
    RuleSerializer,
    UserSerializer,
)


class JudgeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Judge.objects.select_related('court', 'holiday_calendar').order_by('full_name')
    serializer_class = JudgeSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options']
    filterset_fields = ['court']


class CaseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Case.objects.select_related('court', 'lead_attorney').order_by('-filing_date', 'caption')
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options']
    filterset_fields = ['status', 'court', 'lead_attorney']


class DeadlineViewSet(mixins.CreateModelMixin, mixins.UpdateModelMixin, viewsets.ReadOnlyModelViewSet):
    queryset = (
        Deadline.objects.select_related(
            'case',
            'holiday_calendar',
            'owner',
            'created_by',
            'updated_by',
        )
        .order_by('due_at')
    )
    serializer_class = DeadlineSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options', 'patch', 'post']
    filterset_fields = ['case', 'status', 'owner']

    def perform_update(self, serializer):
        deadline = self.get_object()
        before_snapshot = format_deadline_snapshot(deadline)
        instance = serializer.save(updated_by=self.request.user)
        after_snapshot = format_deadline_snapshot(instance)
        record_audit_event(
            actor=self.request.user,
            entity_table='deadlines',
            entity_id=instance.id,
            action=AuditAction.UPDATE,
            before=before_snapshot,
            after=after_snapshot,
        )

    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user, updated_by=self.request.user)
        record_audit_event(
            actor=self.request.user,
            entity_table='deadlines',
            entity_id=instance.id,
            action=AuditAction.CREATE,
            after=format_deadline_snapshot(instance),
        )

    def get_serializer_class(self):
        if self.request.method.lower() == 'post':
            return DeadlineCreateSerializer
        return super().get_serializer_class()


class RuleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Rule.objects.select_related('superseded_by').order_by('citation')
    serializer_class = RuleSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options']
    filterset_fields = ['source_type', 'jurisdiction']


class DeadlineReminderViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = DeadlineReminder.objects.select_related('deadline', 'deadline__case').order_by('notify_at')
    serializer_class = DeadlineReminderSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['deadline', 'channel', 'sent']
    http_method_names = ['get', 'post', 'delete', 'head', 'options']


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.order_by('-created_at')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options']
    filterset_fields = ['entity_table', 'entity_id', 'action']


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.order_by('full_name')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options']
