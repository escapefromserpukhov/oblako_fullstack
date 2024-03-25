import logging
logger = logging.getLogger( __name__)

from django.shortcuts import render
from django.http import FileResponse
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from django.utils import timezone

from .serializers import FileSerializer
from .models import File
from utils.constants import create_response_data, public_file_fields, check_request_file, factory_current_data
from oblako.settings import FILE_SYSTEM
from utils.mixins import StaffEditorPermissionMixin

class FileAPIView(generics.ListAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        response = Response()
        user_id = kwargs.get('pk', None)
        if user_id:
            files = self.queryset.filter(owner_id=user_id).values(*public_file_fields)
            response.data = create_response_data(files)
            return response
        else:
            response = super().get(self, request, args, kwargs)
            if response:
                response.data = create_response_data(response.data)
        return response
    
    def post(self, request):
        serializer = FileSerializer(data=request.data)

        data = {}

        if serializer.is_valid():
            if check_request_file(request):
                serializer.create(user_id=request.user.id, file=request.FILES['file'])

                data = self.get_queryset().filter(owner_id=request.user.id).values(*public_file_fields)
                
                return Response(create_response_data(data), status=status.HTTP_200_OK)
            else:
                return Response(
                    create_response_data(type='error', data=[{'message': 'Файл не найден, выберите файл и отправьте'}]),
                    status=status.HTTP_400_BAD_REQUEST
                )

        data = serializer.errors

        return Response(data)

class FileDeleteAPIView(StaffEditorPermissionMixin, generics.DestroyAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer

    def delete(self, request, *args, **kwargs):
        file_ids = request.data
        pk = kwargs.get('pk', None)
        response = Response()
        if file_ids:
            files = self.queryset.filter(id__in=file_ids)
            for file in files:
                FILE_SYSTEM.delete(str(file))
            count, _ = files.delete()
            if count:
                response.data = create_response_data({ 'message': 'Выбранные файлы удалены' })
                response.status_code = status.HTTP_200_OK
            else:
                response.data = create_response_data({ 'message': 'Выбранные файлы не существуют' }, 'error')
                response.status_code = status.HTTP_404_NOT_FOUND
        elif pk:
            response = super().delete(self, request, args, kwargs)
            if response:
                response.data = create_response_data({ "message": "Файл удален" })
                response.status_code = status.HTTP_200_OK
        else:
            response.data = create_response_data({ 'message': 'Переданы не корректные данные' }, 'error')
            response.status_code = status.HTTP_400_BAD_REQUEST

        return response


class FileUpdateAPIView(StaffEditorPermissionMixin, generics.UpdateAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    lookup_field = 'pk' # default

    def patch(self, request, *args, **kwargs):
        response = super().patch(request, *args, **kwargs)
        if response:
            data = response.data
            response.data = create_response_data(factory_current_data(data, public_file_fields))
        return response


@api_view(['GET'])
def download_file(request, link_id):
    file = File.objects.filter(public_link=link_id).first()

    if file:
        file.downloaded_at = timezone.now()
        file.save()
        
        return FileResponse(file.file, status.HTTP_200_OK, as_attachment=True, filename=file.origin_name)

    if request.user.id is not None:
        return Response(
            create_response_data({ 'message': 'Файл не найден' }, 'error'),
            status=status.HTTP_404_NOT_FOUND
        )
        
    return render(request, 'not_found.html')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_link(request, file_id):
    user_id = request.user.id

    if request.user.role == 'admin':
        file = File.objects.filter(id=file_id).first()
    else:
        file = File.objects.filter(owner_id=user_id).filter(id=file_id).first()
    
    if file:
        data = create_response_data({ 'link_id': file.public_link })

        return Response(data, status=status.HTTP_200_OK)
    
    return Response(create_response_data({'message': 'Файл не найден'}, 'error'), status=status.HTTP_404_NOT_FOUND)