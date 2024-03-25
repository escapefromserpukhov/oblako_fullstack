from django.urls import path, include
from django.contrib import admin

urlpatterns = [
    path('api/', include('authorize.urls')),
    path('api/users/', include('users.urls')),
    path('api/files/', include('files.urls')),
    path('', include('core.urls')),
]
