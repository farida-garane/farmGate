from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import AccessToken

from .serializers import LoginSerializer, RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ : crée un compte et renvoie un token."""

    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = AccessToken.for_user(user)
        return Response(
            {'token': str(token), 'user': UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class LoginView(generics.GenericAPIView):
    """POST /api/auth/login/ : vérifie les identifiants et renvoie un token."""

    serializer_class = LoginSerializer
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token = AccessToken.for_user(user)
        return Response(
            {'token': str(token), 'user': UserSerializer(user).data},
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    """GET /api/auth/me/ : renvoie le profil de l'utilisateur actuellement connecté."""

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        return Response(UserSerializer(request.user).data)


class LogoutView(APIView):
    """POST /api/auth/logout/ : la déconnexion se fait côté frontend (suppression du token)."""

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        return Response(status=status.HTTP_204_NO_CONTENT)


# Admin views
class AdminUsersListView(APIView):
    """GET /api/admin/users/ : liste tous les utilisateurs (admin only)."""

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {'detail': 'Accès non autorisé'},
                status=status.HTTP_403_FORBIDDEN
            )
        users = User.objects.all()
        # Synchroniser le statut des anciens comptes qui n'ont pas encore de statut
        for user in users:
            if not user.statut:
                user.statut = 'ACTIF' if user.is_active else 'INACTIF'
                user.save(update_fields=['statut'])
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class AdminUserDetailView(APIView):
    """GET /api/admin/users/<id>/ : détail d'un utilisateur (admin only)."""

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, pk, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {'detail': 'Accès non autorisé'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            user = User.objects.get(pk=pk)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Utilisateur non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, pk, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {'detail': 'Accès non autorisé'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            user = User.objects.get(pk=pk)
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Utilisateur non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminUserToggleActiveView(APIView):
    """POST /api/admin/users/<id>/toggle-active/ : activer/désactiver un compte (admin only)."""

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {'detail': 'Accès non autorisé'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            user = User.objects.get(pk=pk)
            user.is_active = not user.is_active
            user.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Utilisateur non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminUserCreateView(APIView):
    """POST /api/admin/users/create/ : crée un utilisateur (admin only)."""

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {'detail': 'Accès non autorisé'},
                status=status.HTTP_403_FORBIDDEN
            )
        data = request.data
        required = ['last_name', 'first_name', 'telephone', 'email', 'localite', 'password', 'role']
        for field in required:
            if not data.get(field):
                return Response(
                    {'detail': f'Le champ {field} est requis.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        if User.objects.filter(email=data['email']).exists():
            return Response(
                {'detail': 'Un utilisateur avec cet email existe déjà.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Generate username from email prefix
        username = data['email'].split('@')[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=data['email'],
            password=data['password'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            telephone=data.get('telephone', ''),
            localite=data.get('localite', ''),
            role=data['role'],
            statut='ACTIF',
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class AdminUserChangeStatutView(APIView):
    """POST /api/admin/users/<id>/statut/ : change le statut d'un utilisateur (admin only)."""

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {'detail': 'Accès non autorisé'},
                status=status.HTTP_403_FORBIDDEN
            )
        new_statut = request.data.get('statut')
        if new_statut not in ('ACTIF', 'INACTIF', 'SUPPRIME'):
            return Response(
                {'detail': 'Statut invalide.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            user = User.objects.get(pk=pk)
            user.statut = new_statut
            # Sync is_active with statut
            user.is_active = (new_statut == 'ACTIF')
            user.save()
            return Response(UserSerializer(user).data)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Utilisateur non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )