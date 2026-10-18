from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # L'administrateur n'est pas un rôle : c'est un compte is_staff / superuser
    class Role(models.TextChoices):
        AGRICULTEUR = 'AGRICULTEUR', 'Agriculteur'
        CONSEILLER = 'CONSEILLER', 'Conseiller agricole'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.AGRICULTEUR,
        verbose_name="Rôle",
    )
    telephone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name="Numéro de téléphone",
    )
    localisation = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        verbose_name="Localisation / Région",
    )
    date_creation = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date d'inscription",
    )

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ['-date_joined']

    def __str__(self):
        full = self.get_full_name()
        return f"{full or self.username} ({self.get_role_display()})"

    @property
    def is_agriculteur(self):
        return self.role == self.Role.AGRICULTEUR

    @property
    def is_conseiller(self):
        return self.role == self.Role.CONSEILLER

    @property
    def is_admin_role(self):
        return self.is_staff or self.is_superuser
