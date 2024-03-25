from rest_framework import serializers

from users.models import User
from utils.validators import min_length, spec_symbol, include_capitalize

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        # TODO - добавить валидаторы на корректность введенных символов в пароле в соотв с требованиями
        validators=[
            lambda value: min_length(value, 6, 'пароля'),
            lambda value: spec_symbol(value),
            lambda value: include_capitalize(value)
        ]
    )
    class Meta:
        model = User
        fields = [
            "id", 
            "username",
            "role",
            "email",
            "password",
            "is_staff",
            # "first_name",
            # "last_name",
            # "is_active",
        ]
        extra_kwargs = {"id": {"read_only": True}, "password": {"write_only": True}, "is_staff": {"write_only": True}}

    def create(self, validated_data):
        email        = validated_data['email']
        username     = validated_data['username']
        password     = validated_data['password']
        role         = 'admin'
        is_staff     = True
        is_superuser = True

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=role,
            is_staff=is_staff,
            is_superuser=is_superuser
        )

        return user