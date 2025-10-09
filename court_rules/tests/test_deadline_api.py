from __future__ import annotations

from datetime import timedelta
from unittest.mock import patch

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from court_rules.models import (
    AuditLog,
    Case,
    CaseStatus,
    Court,
    Deadline,
    DeadlineBasis,
    DeadlineReminder,
    DeadlineTriggerType,
    User,
    UserRole,
)


class DeadlineApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            email='tester@example.com',
            password='password123',
            full_name='Test User',
            role=UserRole.LAWYER,
        )
        cls.token = Token.objects.create(user=cls.user)

        cls.court = Court.objects.create(
            name='Northern District of Illinois',
            timezone='America/Chicago',
        )

        cls.case = Case.objects.create(
            internal_case_id='CASE-123',
            caption='Example v. Sample',
            court=cls.court,
            status=CaseStatus.OPEN,
            timezone='America/Chicago',
        )

    def auth_headers(self):
        return {
            'HTTP_AUTHORIZATION': f'Token {self.token.key}',
        }

    def test_create_deadline_records_audit_log(self):
        due_at = timezone.now() + timedelta(days=5)
        payload = {
            'case': str(self.case.id),
            'trigger_type': DeadlineTriggerType.USER,
            'trigger_source_type': 'manual_entry',
            'trigger_source_id': None,
            'basis': DeadlineBasis.CALENDAR_DAYS,
            'holiday_calendar': None,
            'due_at': due_at.isoformat(),
            'timezone': 'America/Chicago',
            'owner': None,
            'priority': 3,
            'status': 'open',
            'snooze_until': None,
            'extension_notes': '',
            'outcome': '',
            'computation_rationale': 'Initial entry',
        }

        with patch('court_rules.api.v1.viewsets.record_audit_event') as mock_audit:
            response = self.client.post(
                '/api/v1/deadlines/',
                payload,
                format='json',
                **self.auth_headers(),
            )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Deadline.objects.count(), 1)
        mock_audit.assert_called_once()

    def test_create_deadline_rejects_past_due_date(self):
        payload = {
            'case': str(self.case.id),
            'trigger_type': DeadlineTriggerType.USER,
            'trigger_source_type': 'manual_entry',
            'trigger_source_id': None,
            'basis': DeadlineBasis.CALENDAR_DAYS,
            'holiday_calendar': None,
            'due_at': (timezone.now() - timedelta(days=1)).isoformat(),
            'timezone': 'America/Chicago',
            'owner': None,
            'priority': 3,
            'status': 'open',
            'snooze_until': None,
            'extension_notes': '',
            'outcome': '',
            'computation_rationale': '',
        }

        response = self.client.post(
            '/api/v1/deadlines/',
            payload,
            format='json',
            **self.auth_headers(),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('due_at', response.data)

    def test_update_deadline_marks_audit_log(self):
        deadline = Deadline.objects.create(
            case=self.case,
            trigger_type=DeadlineTriggerType.USER,
            basis=DeadlineBasis.CALENDAR_DAYS,
            due_at=timezone.now() + timedelta(days=4),
            timezone='America/Chicago',
            priority=3,
            status='open',
            created_by=self.user,
            updated_by=self.user,
        )

        response = self.client.patch(
            f'/api/v1/deadlines/{deadline.id}/',
            {'status': 'done'},
            format='json',
            **self.auth_headers(),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        deadline.refresh_from_db()
        self.assertEqual(deadline.status, 'done')
        self.assertEqual(AuditLog.objects.filter(entity_id=deadline.id, action='update').count(), 1)

    def test_create_deadline_reminder_requires_future_time(self):
        deadline = Deadline.objects.create(
            case=self.case,
            trigger_type=DeadlineTriggerType.USER,
            basis=DeadlineBasis.CALENDAR_DAYS,
            due_at=timezone.now() + timedelta(days=2),
            timezone='America/Chicago',
            priority=3,
            status='open',
            created_by=self.user,
            updated_by=self.user,
        )

        past_payload = {
            'deadline': str(deadline.id),
            'notify_at': (timezone.now() - timedelta(hours=1)).isoformat(),
            'channel': 'email',
        }

        response = self.client.post(
            '/api/v1/deadline-reminders/',
            past_payload,
            format='json',
            **self.auth_headers(),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('notify_at', response.data)

        future_payload = {
            'deadline': str(deadline.id),
            'notify_at': (timezone.now() + timedelta(hours=3)).isoformat(),
            'channel': 'email',
        }

        response = self.client.post(
            '/api/v1/deadline-reminders/',
            future_payload,
            format='json',
            **self.auth_headers(),
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DeadlineReminder.objects.filter(deadline=deadline).count(), 1)
