from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Profil renvoyé après l'inscription, la connexion ou l'appel à /me/."""

    localite = serializers.CharField(source='localisation', read_only=True, allow_null=True)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'is_staff',
            'telephone',
            'localisation',
            'localite',
        )


class RegisterSerializer(serializers.ModelSerializer):
    """
    Inscription publique : permet de créer un compte avec mot de passe et rôle sélectionné.
    """

    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=User.Role.choices,
        default=User.Role.AGRICULTEUR,
        required=False,
    )
    localite = serializers.CharField(
        source='localisation',
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    class Meta:
        model = User
        fields = (
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'telephone',
            'localisation',
            'localite',
            'password',
            'password2',
        )

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
    """Vérifie le nom d'utilisateur (ou adresse email) et le mot de passe."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        login_input = attrs['username'].strip()
        password = attrs['password']

        # 1. Tentative d'authentification directe avec le nom d'utilisateur
        user = authenticate(
            request=self.context.get('request'),
            username=login_input,
            password=password,
        )

        # 2. Si échec, tentative via l'adresse email
        if user is None:
            try:
                user_obj = User.objects.filter(email__iexact=login_input).first()
                if user_obj:
                    user = authenticate(
                        request=self.context.get('request'),
                        username=user_obj.username,
                        password=password,
                    )
            except Exception:
                pass

        if user is None:
            raise serializers.ValidationError("Nom d'utilisateur ou mot de passe incorrect.")

        if not user.is_active:
            raise serializers.ValidationError("Ce compte utilisateur est désactivé.")

        attrs['user'] = user
        return attrs


class AdminUserSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la gestion des utilisateurs dans l'espace admin."""

    localite = serializers.CharField(source='localisation', required=False, allow_blank=True, allow_null=True)
    statut = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'is_staff',
            'is_active',
            'telephone',
            'localisation',
            'localite',
            'date_creation',
            'statut',
        )

    def get_statut(self, obj):
        return 'ACTIF' if obj.is_active else 'INACTIF'


class AdminUserCreateSerializer(serializers.ModelSerializer):
    """Création d'un utilisateur par un administrateur."""

    password = serializers.CharField(write_only=True)
    localite = serializers.CharField(source='localisation', required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = (
            'email',
            'first_name',
            'last_name',
            'role',
            'telephone',
            'localisation',
            'localite',
            'password',
        )

    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data.get('email', '')

        # Générer un nom d'utilisateur à partir de l'email ou du prénom/nom
        if email:
            base_username = email.split('@')[0]
        else:
            first = validated_data.get('first_name', '')
            last = validated_data.get('last_name', '')
            base_username = f"{first}_{last}".strip('_').lower()

        username = base_username or 'user'
        count = 1
        original_username = username
        while User.objects.filter(username=username).exists():
            username = f"{original_username}{count}"
            count += 1

        validated_data['username'] = username
        return User.objects.create_user(password=password, **validated_data)
