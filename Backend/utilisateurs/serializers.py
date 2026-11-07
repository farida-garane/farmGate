from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Profil renvoyé après l'inscription ou la connexion."""

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name',
                  'role', 'is_staff', 'is_active', 'telephone', 'localite', 'date_creation', 'statut')


class RegisterSerializer(serializers.ModelSerializer):
    """
    Inscription publique : l'utilisateur choisit son rôle (AGRICULTEUR ou CONSEILLER).
    """

    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name',
                  'telephone', 'localite', 'role', 'password', 'password2')
        extra_kwargs = {
            'role': {'required': False},  # Défaut = AGRICULTEUR si non fourni
        }

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError(
                {'password2': "Les mots de passe ne correspondent pas."}
            )
        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    """Vérifie le nom d'utilisateur et le mot de passe."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get('request'),
            username=attrs['username'],
            password=attrs['password'],
        )
        if user is None:
            raise serializers.ValidationError("Nom d'utilisateur ou mot de passe incorrect.")
        attrs['user'] = user
        return attrs
