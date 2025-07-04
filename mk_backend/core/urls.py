from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkerProfileViewSet, EmployerViewSet, JobPostingViewSet,
    ApplicationViewSet, MatchScoreViewSet
)
from .webhooks import whatsapp_webhook, ussd_webhook
from .health import health_check
from .auth_views import (
    register_worker, register_employer, login_worker, get_user_profile
)

router = DefaultRouter()
router.register(r'workers', WorkerProfileViewSet)
router.register(r'employers', EmployerViewSet)
router.register(r'jobs', JobPostingViewSet)
router.register(r'applications', ApplicationViewSet)
router.register(r'matches', MatchScoreViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/register/worker/', register_worker, name='register_worker'),
    path('api/auth/register/employer/', register_employer, name='register_employer'),
    path('api/auth/login/worker/', login_worker, name='login_worker'),
    path('api/auth/profile/', get_user_profile, name='get_user_profile'),
    path('webhook/whatsapp/', whatsapp_webhook, name='whatsapp_webhook'),
    path('webhook/ussd/', ussd_webhook, name='ussd_webhook'),
    path('health/', health_check, name='health_check'),
]