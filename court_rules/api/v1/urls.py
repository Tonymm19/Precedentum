from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token

from court_rules.api.v1.viewsets import (
    AuditLogViewSet,
    CaseViewSet,
    DeadlineReminderViewSet,
    DeadlineViewSet,
    JudgeViewSet,
    RuleViewSet,
    UserViewSet,
)

router = DefaultRouter()
router.register(r'judges', JudgeViewSet, basename='judge')
router.register(r'cases', CaseViewSet, basename='case')
router.register(r'deadlines', DeadlineViewSet, basename='deadline')
router.register(r'rules', RuleViewSet, basename='rule')
router.register(r'deadline-reminders', DeadlineReminderViewSet, basename='deadline-reminder')
router.register(r'audit-log', AuditLogViewSet, basename='audit-log')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('auth/token/', obtain_auth_token, name='api-token-auth'),
]
urlpatterns += router.urls
