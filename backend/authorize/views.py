from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView

from users.models import User
from users.serializers import UserSerializer
from .serializers import RegisterSerializer
from utils.constants import create_response_data


class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data = request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            refresh.payload.update({
                'user_id': user.id,
                'email': user.email
            })
            
            login(request, user)
            
            response = Response(
                create_response_data({ 'user': serializer.data, 'access_token': str(refresh.access_token)}),
                status=status.HTTP_201_CREATED
            )

            response.set_cookie('refresh_token', str(refresh))

            return response
        data = []
        for error in serializer.errors:
            data.append({ "message": '\n'.join(serializer.errors[error]) })

        return Response(
            create_response_data(data, type='error'),
            status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        email = data.get('email', None)
        password = data.get('password', None)

        if email is None or password is None:
            return Response(
                create_response_data(type='error', data={'message': 'Нужен и email, и пароль'}),
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response(
                create_response_data([{"message": 'Некорректно введены email или пароль'}], 'error'),
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        login(request, user)

        refresh = RefreshToken.for_user(user)

        refresh.payload.update({
            'user_id': user.id,
            'email': user.email
        })
        
        userData = UserSerializer(user).data
        
        response = Response(
            create_response_data({ 'user': userData, 'access_token': str(refresh.access_token) }),
             status=status.HTTP_200_OK
        )

        response.set_cookie('refresh_token', str(refresh))
        

        return response

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            token = request.COOKIES.get('refresh_token')
            refresh = RefreshToken(token)
            refresh.blacklist()
            logout(request)
            response = Response(create_response_data({'message': 'Выход успешен'}), status=status.HTTP_200_OK);
            response.delete_cookie('refresh_token')
            return response
        except Exception as e:
            response = Response(
                create_response_data(
                    type='error',
                    data=[{'message': 'Что-то пошло не так повторите попытку'}]
                ),
                status=status.HTTP_400_BAD_REQUEST
            )
            if str(e) == 'Token is blacklisted':
                response.delete_cookie('refresh_token')
                response.data = create_response_data(
                    type='error',
                    data=[{'message': 'Токен в черном списке'}]
                )
            return response