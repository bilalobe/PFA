from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('utilisateur.urls')),
    path('api/', include('cours.urls')),
    path('api/', include('module.urls')),
    path('', include('frontend.urls')), 
]