from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views

from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

from .views import registration_view, protected_view, teacher_only_view, MyTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),

    # API Documentation 
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Authentication Endpoints
    path('api/auth/register/', registration_view, name='register'),
    path('api/auth/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'), 

    # Protected Endpoints (These may need to be moved to relevant apps)
    path('api/protected/', protected_view, name='protected_view'), 
    path('api/teacher/', teacher_only_view, name='teacher_only_view'),

    # App-Specific URLs
    path('api/user/', include('user.urls')),
    path('api/course/', include('course.urls')),
    path('api/module/', include('module.urls')),
    path('api/quiz/', include('quiz.urls')), 
    path('api/enrollment/', include('enrollment.urls')), 
    path('api/forum/', include('forum.urls')),
    path('api/resource/', include('resource.urls')),
    path('api/moderation/', include('moderation.urls')),
    path('api/chat/', include('chat.urls')),  

    # ... (remove redundant paths)

    # Frontend Endpoints (Consider using Next.js for the frontend)
    # path('', include('frontend.urls')),

    # ... (remove chatbot endpoint, as it's likely handled by the `chat` app)
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) 