from django.urls import path

from .views import FileAPIView, FileDeleteAPIView, get_link, download_file, FileUpdateAPIView

# api/files/
urlpatterns = [
    path('', FileAPIView.as_view()),
    path('load/', FileAPIView.as_view()),
    path('<int:pk>/', FileAPIView.as_view()),
    path('delete/', FileDeleteAPIView.as_view()),
    path('update/<int:pk>/', FileUpdateAPIView.as_view()),
    path('delete/<int:pk>/', FileDeleteAPIView.as_view()),
    path('link/<int:file_id>/', get_link),
    path('download/<str:link_id>/', download_file),
]