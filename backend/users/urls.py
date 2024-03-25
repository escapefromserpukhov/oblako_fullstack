from django.urls import path

from .views import get_users, get_me, UserDeleteAPIView, UserUpdateAPIView

# api/users/
urlpatterns = [
    path('', get_users),
    path('me/', get_me),
    path('delete/', UserDeleteAPIView.as_view()),
    path('delete/<int:pk>/', UserDeleteAPIView.as_view()),
    path('update/<int:pk>/', UserUpdateAPIView.as_view()),
]