from django.core.files import File as FileCore
from rest_framework import serializers

from utils.constants import generate_storage_file_name, generate_random_link
from users.models import User
from .models import File

class FileSerializer(serializers.ModelSerializer):

    file = serializers.FileField(write_only=True, allow_empty_file=True, required=False)
    comment = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    public_link = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = File
        fields = [
            'id',
            'owner',
            'name',
            'origin_name',
            'created_at',
            'downloaded_at',
            'custom_name',
            'size',
            'comment',
            'file',
            'public_link'
        ]
        extra_kwargs = {
            "id"           : {"read_only": True},
            "owner"        : {"read_only": True},
            "downloaded_at": {"read_only": True},
            "created_at"   : {"read_only": True},
            "public_link"  : {"write_only": True},
        }

    def create(self, **kwargs):

        file = FileCore(self.validated_data['file'])
        
        origin_name = file.name
        storage_name = generate_storage_file_name(file.name)
        file.name = storage_name
        
        user = User.objects.filter(id=kwargs['user_id']).first()
        data = {
            'owner'      : user,
            'name'       : storage_name,
            'origin_name': origin_name,
            'custom_name': self.validated_data['custom_name'] or origin_name,
            'size'       : file.size,
            'comment'    : self.validated_data['comment'],
            'file'       : file,
            'public_link': generate_random_link(50),
        }
        
        try:
            file_model = File.objects.create(**data)

            return file_model

        except Exception as e:
            error = {
                'message': ', '.join(e.args) if len(e.args) > 0 else 'Unknown Error'
            }
            
            raise serializers.ValidationError(error)