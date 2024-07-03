from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from .views import MyTokenObtainPairView, login_view, registration_view

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),
    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/schema/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    # Authentication
    path("api/auth/register/", registration_view, name="register"),
    path("api/auth/login/", login_view, name="login"),
    path("api/auth/token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # App-Specific URLs
    path("api/users/", include("user.urls")),
    path("api/courses/", include("course.urls")), 
    path("api/resources/", include("resource.urls")),
    path("api/enrollments/", include("enrollment.urls")),
    path("api/moderation/", include("moderation.urls")), 
    path("api/chat/", include("chat.urls")), 
    # AI URLs
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) 