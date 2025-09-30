from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DistrictViewSet, JudgeViewSet, RuleCategoryViewSet,
    RuleViewSet, CaseViewSet, DeadlineViewSet, RuleChangeViewSet
)

router = DefaultRouter()
router.register(r'districts', DistrictViewSet)
router.register(r'judges', JudgeViewSet)
router.register(r'rule-categories', RuleCategoryViewSet)
router.register(r'rules', RuleViewSet)
router.register(r'cases', CaseViewSet)
router.register(r'deadlines', DeadlineViewSet)
router.register(r'rule-changes', RuleChangeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]