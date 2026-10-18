from django.conf import settings
from django.db import models


class Recommandation(models.Model):
    """Conseil envoyé par un conseiller agricole à un agriculteur."""

    class Type(models.TextChoices):
        ACCOMPAGNEMENT = 'ACCOMPAGNEMENT', 'Accompagnement'
        ANALYSE = 'ANALYSE', "Analyse d'activité"
        PREVENTION = 'PREVENTION', 'Recommandation préventive'

    conseiller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recommandations_envoyees',
        verbose_name="Conseiller",
    )
    agriculteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recommandations_recues',
        verbose_name="Agriculteur",
    )
    # Facultatif : une recommandation peut viser une campagne précise
    campagne = models.ForeignKey(
        'agriculteur.Campagne',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='recommandations',
        verbose_name="Campagne",
    )
    type = models.CharField(max_length=20, choices=Type.choices, verbose_name="Type")
    titre = models.CharField(max_length=150, verbose_name="Titre")
    message = models.TextField(verbose_name="Message")
    lue = models.BooleanField(default=False, verbose_name="Lue par l'agriculteur")
    date_creation = models.DateTimeField(auto_now_add=True, verbose_name="Date d'envoi")

    class Meta:
        verbose_name = "Recommandation"
        verbose_name_plural = "Recommandations"
        ordering = ['-date_creation']

    def __str__(self):
        return f"{self.titre} → {self.agriculteur.username}"
