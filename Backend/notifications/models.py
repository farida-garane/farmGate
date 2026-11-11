from django.conf import settings
from django.db import models


class Notification(models.Model):
    """Notification interne affichée dans la cloche de l'utilisateur."""

    class Type(models.TextChoices):
        RECOMMANDATION = 'RECOMMANDATION', 'Recommandation'
        INSCRIPTION = 'INSCRIPTION', 'Nouvelle inscription'
        COMPTE = 'COMPTE', 'Compte'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name="Utilisateur",
    )
    type = models.CharField(max_length=20, choices=Type.choices, verbose_name="Type")
    titre = models.CharField(max_length=150, verbose_name="Titre")
    message = models.TextField(blank=True, verbose_name="Message")
    lue = models.BooleanField(default=False, verbose_name="Lue")
    # Lien interne optionnel (ex. /agriculteur/recommandations) ouvert au clic
    lien = models.CharField(max_length=200, blank=True, verbose_name="Lien")
    date_creation = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-date_creation']

    def __str__(self):
        return f"{self.titre} → {self.user.username}"
