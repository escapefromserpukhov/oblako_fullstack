from django.urls import path

from .views import RegisterView, LoginView, LogoutView

urlpatterns = [
    path('signup', RegisterView.as_view()),
    path('signin', LoginView.as_view()),
    path('logout', LogoutView.as_view())
]
