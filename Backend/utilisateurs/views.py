from django.contrib.auth import get_user_model, login, logout
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.utils import notifier_compte, notifier_inscription

from .serializers import (
    AdminUserCreateSerializer,
    AdminUserSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()


@method_decorator(ensure_csrf_cookie, name='dispatch')
class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ : crée un compte et connecte l'utilisateur."""

    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user)
        notifier_inscription(user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@method_decorator(ensure_csrf_cookie, name='dispatch')
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


@method_decorator(ensure_csrf_cookie, name='dispatch')
class MeView(APIView):
    """GET /api/auth/me/ : renvoie l'utilisateur connecté actuellement."""

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class LogoutView(APIView):
    """POST /api/auth/logout/ : déconnecte l'utilisateur et ferme la session."""

    # IsAuthenticated : seul un utilisateur connecté peut se déconnecter
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        logout(request)
        return Response({'detail': 'Déconnexion réussie.'}, status=status.HTTP_200_OK)


# --- Espace Administrateur ---------------------------------------------------

@method_decorator(ensure_csrf_cookie, name='dispatch')
class AdminUserListView(generics.ListAPIView):
    """GET /api/admin/users/ : liste tous les utilisateurs."""

    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserSerializer
    permission_classes = (permissions.IsAdminUser,)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class AdminUserCreateView(generics.CreateAPIView):
    """POST /api/admin/users/create/ : création d'un utilisateur par l'admin."""

    serializer_class = AdminUserCreateSerializer
    permission_classes = (permissions.IsAdminUser,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        notifier_inscription(user)
        return Response(AdminUserSerializer(user).data, status=status.HTTP_201_CREATED)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/admin/users/<id>/ : consultation/modification/suppression."""

    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = (permissions.IsAdminUser,)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class AdminUserToggleActiveView(APIView):
    """POST /api/admin/users/<id>/toggle-active/ : active ou désactive un compte."""

    permission_classes = (permissions.IsAdminUser,)

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.is_active = not user.is_active
        user.save()
        notifier_compte(user, user.is_active)
        return Response(AdminUserSerializer(user).data, status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class AdminUserStatutView(APIView):
    """POST /api/admin/users/<id>/statut/ : modifie le statut d'un compte."""

    permission_classes = (permissions.IsAdminUser,)

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        statut = request.data.get('statut')
        if statut == 'ACTIF':
            user.is_active = True
        elif statut in ('INACTIF', 'SUPPRIME'):
            user.is_active = False
        user.save()
        data = AdminUserSerializer(user).data
        if statut in ('ACTIF', 'INACTIF', 'SUPPRIME'):
            notifier_compte(user, user.is_active)
            data['statut'] = statut
        return Response(data, status=status.HTTP_200_OK)
