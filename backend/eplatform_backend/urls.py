from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.conf.urls import url  # Optional, for regex URL patterns
from backend.forum.views import moderation_dashboard, delete_post, report_post
from rest_framework_simplejwt.views import TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from .views import registration_view, protected_view, teacher_only_view, MyTokenObtainPairView

# Schema View Configuration
schema_view = get_schema_view(
    openapi.Info(
        title="PFA API",
        default_version='v1',
        description="API documentation for PFA",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('admin/', admin.site.urls),

    # Authentication endpoints
    path('api/auth/register/', registration_view, name='register'),
    path('api/auth/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Token refresh endpoint

    # Protected endpoints
    path('api/protected/', protected_view, name='protected_view'),
    path('api/teacher/', teacher_only_view, name='teacher_only_view'),

    # Include app-specific URLs
    path('api/user/', include('user.urls')),
    path('api/course/', include('course.urls')),
    path('api/module/', include('module.urls')),
    path('api/question/', include('question.urls')),
    path('api/quiz/', include('quiz.urls')),
    path('api/enrollment/', include('enrollment.urls')),
    path('api/forum/', include('forum.urls')),
    path('api/resource/', include('resource.urls')),
    path('api/ai/', include('ai.urls')), # Add your AI app URLs 
    path('api/chatbot/', include('chatbot.urls')), # Add your chatbot app URLs


    # dj-rest-auth for authentication
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),

    # Account login/logout
    path('accounts/login/', auth_views.LoginView.as_view(), name='login'), 
    path('accounts/logout/', auth_views.LogoutView.as_view(), name='logout'), 

    # Frontend endpoints
    path('', include('frontend.urls')),

    # Chatbot
    path('api/messages', views.messages),  # Chatbot messages endpoint

    # Social Auth (Ensure 'social_django' is in INSTALLED_APPS)
    url(r'^auth/', include('social_django.urls', namespace='social')),

    # Spectacular endpoints 
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
