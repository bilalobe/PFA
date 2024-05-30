from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from frontend import views
from django.contrib.auth import views as auth_views
from rest_framework import permissions  
from drf_yasg.views import get_schema_view  
from drf_yasg import openapi 

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
    path('api/utilisateur/', include('utilisateur.urls')),  # Namespace for user API
    path('api/cours/', include('cours.urls')),  # Namespace for course API
    path('api/module/', include('module.urls')),  # Namespace for module API
    path('api/question/', include('question.urls')),  # Add question API URL
    path('api/quiz/', include('quiz.urls')),  # Add quiz API URL
    path('api/enrollment/', include('enrollment.urls')),  # Add enrollment API URL
    path('api/forum/', include('forum.urls')),  # Add forum API URL
    path('api/resource/', include('resource.urls')),  # Add resource API URL
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('accounts/login/', auth_views.LoginView.as_view(), name='login'),
    path('accounts/logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('register/', views.register, name='register'), 
    path('', include('frontend.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
