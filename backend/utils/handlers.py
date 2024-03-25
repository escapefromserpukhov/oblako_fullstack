from rest_framework.response import Response
from rest_framework.views import exception_handler
from rest_framework import status

keywords = [ ("user", "Пользователь"), ("file", "Файл") ]

def handle_exceptions(exception, context):
    response = exception_handler(exception, context)

    if response is not None:
        if response.status_code == 403 or response.status_code == 401:
            response.data['errors'] = [{'message': 'Не авторизован' }]
            response.data['success'] = False
            del response.data['detail']
            return Response(response.data, status=status.HTTP_401_UNAUTHORIZED)

        if response.status_code == 404:
            for tuple in keywords:
                keyword, text = tuple
                if 'detail' in response.data and f' {keyword} ' in str(response.data['detail']).lower():
                    response.data['errors'] = [{ 'message': f'{text} не найден' }]
                    response.data['success'] = False
                    del response.data['detail']
                    return Response(response.data, status=status.HTTP_404_NOT_FOUND)

    return response