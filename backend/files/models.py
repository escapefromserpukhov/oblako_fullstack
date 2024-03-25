from django.db import models
from users.models import User
from django.utils import timezone

from oblako.settings import FILE_SYSTEM

class File(models.Model):
    id            = models.AutoField(primary_key=True, unique=True)
    owner         = models.ForeignKey(User, on_delete=models.CASCADE)
    name          = models.CharField(max_length=100)
    origin_name   = models.CharField(max_length=100, blank=True, null=True)
    custom_name   = models.CharField(max_length=100, blank=True, null=True)
    size          = models.IntegerField(null=True)
    created_at    = models.DateTimeField(auto_now=False, auto_now_add=True, blank=True, null=True)
    downloaded_at = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    comment       = models.TextField(max_length=100, null=True, blank=True)
    file          = models.FileField(storage=FILE_SYSTEM, blank=True)
    public_link   = models.CharField(unique=True, max_length=50, null=True, blank=True)

    def __str__(self):
        return self.name