from django.urls import path, re_path
from .views import front

urlpatterns = [
    path("", front, name="front"),
    path("signin", front, name="front"),
    path("signup", front, name="front"),
    re_path(r'^\/?(?!\/?api).*$', front, name='front')
]