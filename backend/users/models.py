from django.db import models
from django.contrib.auth.models import AbstractUser, PermissionsMixin
from django.core.validators import EmailValidator

from utils.constants import error_messages

class User(AbstractUser, PermissionsMixin):
    id = models.AutoField(primary_key=True, unique=True)
    username = models.CharField(
        db_index=True,
        max_length=50,
        unique=True,
        error_messages={ 'unique': error_messages['unique_user']('username') }
    )
    email = models.EmailField(
        max_length=100,
        unique=True,
        error_messages={ 'unique': error_messages['unique_user']('email') },
        validators=[EmailValidator(message="Введите корректный email")]
    )
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)
    role = models.CharField(max_length=5, default='admin')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
