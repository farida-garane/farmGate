from django.conf import settings
from django.db import models


class Parcelle(models.Model):
    """Terrain cultivé par un agriculteur."""

    agriculteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='parcelles',
        verbose_name="Agriculteur",
    )
    nom = models.CharField(max_length=100, verbose_name="Nom")
    superficie = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Superficie (ha)",
    )
    localisation = models.CharField(max_length=150, blank=True, verbose_name="Localisation")
    type_sol = models.CharField(max_length=100, blank=True, verbose_name="Type de sol")
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Parcelle"
        verbose_name_plural = "Parcelles"
        ordering = ['nom']

    def __str__(self):
        return f"{self.nom} ({self.superficie} ha)"


class Campagne(models.Model):
    """Ce qui est cultivé sur une parcelle pendant une saison (ex. : maïs 2026)."""

    class Statut(models.TextChoices):
        EN_COURS = 'EN_COURS', 'En cours'
        TERMINEE = 'TERMINEE', 'Terminée'

    parcelle = models.ForeignKey(
        Parcelle,
        on_delete=models.CASCADE,
        related_name='campagnes',
        verbose_name="Parcelle",
    )
    culture = models.CharField(max_length=100, verbose_name="Culture")
    date_debut = models.DateField(verbose_name="Date de début")
    date_fin = models.DateField(null=True, blank=True, verbose_name="Date de fin")
    statut = models.CharField(
        max_length=20,
        choices=Statut.choices,
        default=Statut.EN_COURS,
        verbose_name="Statut",
    )

    class Meta:
        verbose_name = "Campagne"
        verbose_name_plural = "Campagnes"
        ordering = ['-date_debut']

    def __str__(self):
        return f"{self.culture} - {self.parcelle.nom} ({self.date_debut:%Y})"


class Intervention(models.Model):
    """Travail réalisé sur une campagne (semis, engrais, traitement…)."""

    class Type(models.TextChoices):
        SEMIS = 'SEMIS', 'Semis'
        ENGRAIS = 'ENGRAIS', 'Engrais'
        TRAITEMENT = 'TRAITEMENT', 'Traitement'
        AUTRE = 'AUTRE', 'Autre'

    campagne = models.ForeignKey(
        Campagne,
        on_delete=models.CASCADE,
        related_name='interventions',
        verbose_name="Campagne",
    )
    type = models.CharField(max_length=20, choices=Type.choices, verbose_name="Type")
    date = models.DateField(verbose_name="Date")
    description = models.TextField(blank=True, verbose_name="Description")

    class Meta:
        verbose_name = "Intervention"
        verbose_name_plural = "Interventions"
        ordering = ['-date']

    def __str__(self):
        return f"{self.get_type_display()} du {self.date}"


class Depense(models.Model):
    """Dépense liée à une campagne (semences, main-d'œuvre…)."""

    class Categorie(models.TextChoices):
        SEMENCES = 'SEMENCES', 'Semences'
        MAIN_OEUVRE = 'MAIN_OEUVRE', "Main-d'œuvre"
        ENGRAIS = 'ENGRAIS', 'Engrais'
        TRAITEMENT = 'TRAITEMENT', 'Traitement'
        AUTRE = 'AUTRE', 'Autre'

    campagne = models.ForeignKey(
        Campagne,
        on_delete=models.CASCADE,
        related_name='depenses',
        verbose_name="Campagne",
    )
    categorie = models.CharField(max_length=20, choices=Categorie.choices, verbose_name="Catégorie")
    montant = models.DecimalField(max_digits=12, decimal_places=0, verbose_name="Montant (FCFA)")
    date = models.DateField(verbose_name="Date")
    description = models.CharField(max_length=255, blank=True, verbose_name="Description")

    class Meta:
        verbose_name = "Dépense"
        verbose_name_plural = "Dépenses"
        ordering = ['-date']

    def __str__(self):
        return f"{self.get_categorie_display()} : {self.montant} FCFA"


class Recolte(models.Model):
    """Quantité produite lors d'une récolte."""

    class Unite(models.TextChoices):
        KG = 'KG', 'Kilogramme'
        TONNE = 'TONNE', 'Tonne'
        SAC = 'SAC', 'Sac'

    campagne = models.ForeignKey(
        Campagne,
        on_delete=models.CASCADE,
        related_name='recoltes',
        verbose_name="Campagne",
    )
    date = models.DateField(verbose_name="Date")
    quantite = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Quantité")
    unite = models.CharField(
        max_length=10,
        choices=Unite.choices,
        default=Unite.KG,
        verbose_name="Unité",
    )

    class Meta:
        verbose_name = "Récolte"
        verbose_name_plural = "Récoltes"
        ordering = ['-date']

    def __str__(self):
        return f"{self.quantite} {self.get_unite_display()} le {self.date}"
