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
    path("api/user/", include("user.urls")),
    path("api/courses/", include("course.urls")),
    path("api/modules/", include("module.urls")),
    path("api/quizzes/", include("quiz.urls")),
    path("api/enrollments/", include("enrollment.urls")),
    path("api/forums/", include("forum.urls")),
    path("api/resources/", include("resource.urls")),
    path("api/moderation/", include("moderation.urls")),
    path("api/chat/", include("chat.urls")),
    # AI URLs
    path("api/ai/", include("ai.urls")),
    path("api/generator/", include("generator.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL)
    urlpatterns += static(settings.STATIC_URL)

"""
This file defines the URL patterns for the e-platform backend application.

The urlpatterns list contains the following patterns:
- Admin: The path "admin/" is mapped to the Django admin site.
- API Documentation: The paths "api/schema/", "api/schema/swagger-ui/", and "api/schema/redoc/" are mapped to the SpectacularAPIView, SpectacularSwaggerView, and SpectacularRedocView respectively, which provide API documentation using the drf-spectacular library.
- Authentication: The paths "api/auth/register/", "api/auth/login/", "api/auth/token/", and "api/auth/token/refresh/" are mapped to the registration, login, token obtain, and token refresh views respectively.
- App-Specific URLs: The paths starting with "api/user/", "api/courses/", "api/modules/", "api/quizzes/", "api/enrollments/", "api/forums/", "api/resources/", "api/moderation/", "api/ai/", and "api/chat/" are mapped to the corresponding app-specific URLs.

If the DEBUG setting is enabled, the urlpatterns list is extended with the static URLs for serving media and static files.

Note: This file is used by Django to route incoming requests to the appropriate views.
"""
