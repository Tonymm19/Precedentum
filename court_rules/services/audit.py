from __future__ import annotations

from typing import Any, Optional

from django.db import transaction

from court_rules.models import AuditAction, AuditLog, User


def record_audit_event(
    *,
    actor: Optional[User],
    entity_table: str,
    entity_id: Any,
    action: AuditAction,
    before: Optional[dict[str, Any]] = None,
    after: Optional[dict[str, Any]] = None,
) -> AuditLog:
    """Persist a single audit log entry."""

    with transaction.atomic():
        log = AuditLog.objects.create(
            actor_user=actor,
            entity_table=entity_table,
            entity_id=entity_id,
            action=action,
            before=before or None,
            after=after or None,
        )
    return log


def format_deadline_snapshot(deadline) -> dict[str, Any]:
    """Return a minimal dict describing the important deadline fields."""

    return {
        'id': str(deadline.id),
        'case_id': str(deadline.case_id) if deadline.case_id else None,
        'trigger_type': deadline.trigger_type,
        'trigger_source_type': deadline.trigger_source_type,
        'trigger_source_id': str(deadline.trigger_source_id) if deadline.trigger_source_id else None,
        'basis': deadline.basis,
        'holiday_calendar_id': str(deadline.holiday_calendar_id) if deadline.holiday_calendar_id else None,
        'due_at': deadline.due_at.isoformat() if deadline.due_at else None,
        'timezone': deadline.timezone,
        'owner_id': str(deadline.owner_id) if deadline.owner_id else None,
        'priority': deadline.priority,
        'status': deadline.status,
        'snooze_until': deadline.snooze_until.isoformat() if deadline.snooze_until else None,
        'extension_notes': deadline.extension_notes,
        'outcome': deadline.outcome,
        'computation_rationale': deadline.computation_rationale,
    }
