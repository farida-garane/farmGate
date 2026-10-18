from django.contrib.auth import login
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .serializers import LoginSerializer, RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ : crée un compte et connecte l'utilisateur."""

    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """POST /api/auth/login/ : ouvre la session et renvoie le profil."""

    serializer_class = LoginSerializer
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
