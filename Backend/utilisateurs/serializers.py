from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Profil renvoyé après l'inscription ou la connexion."""

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name',
                  'role', 'is_staff', 'telephone', 'localisation')


class RegisterSerializer(serializers.ModelSerializer):
    """
    Inscription publique : le compte est toujours créé avec le rôle par défaut
    (AGRICULTEUR). Seul l'administrateur peut ensuite changer le rôle.
    """

    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name',
                  'telephone', 'localisation', 'password', 'password2')

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
