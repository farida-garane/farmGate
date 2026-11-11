from django.contrib.auth import get_user_model
from rest_framework import serializers

from agriculteur.models import Campagne
from agriculteur.serializers import (
    DepenseSerializer,
    InterventionSerializer,
    ParcelleSerializer,
    RecolteSerializer,
)

from .models import Recommandation

User = get_user_model()


# --- Consultation des données des agriculteurs (lecture seule) --------------

class AgriculteurSerializer(serializers.ModelSerializer):
    nb_parcelles = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name',
                  'telephone', 'localisation', 'nb_parcelles')


class ParcelleConseillerSerializer(ParcelleSerializer):
    class Meta(ParcelleSerializer.Meta):
        fields = ParcelleSerializer.Meta.fields + ('agriculteur',)


class CampagneConseillerSerializer(serializers.ModelSerializer):
    """Campagne avec tout ce que l'agriculteur a renseigné, pour l'analyse."""

    parcelle_nom = serializers.CharField(source='parcelle.nom', read_only=True)
    agriculteur = serializers.IntegerField(source='parcelle.agriculteur_id', read_only=True)
    interventions = InterventionSerializer(many=True, read_only=True)
    depenses = DepenseSerializer(many=True, read_only=True)
    recoltes = RecolteSerializer(many=True, read_only=True)
    total_depenses = serializers.SerializerMethodField()

    class Meta:
        model = Campagne
        fields = ('id', 'agriculteur', 'parcelle', 'parcelle_nom', 'culture',
                  'date_debut', 'date_fin', 'statut', 'total_depenses',
                  'interventions', 'depenses', 'recoltes')

    def get_total_depenses(self, campagne):
        return sum(d.montant for d in campagne.depenses.all())


# --- Recommandations ---------------------------------------------------------

class RecommandationSerializer(serializers.ModelSerializer):
    """Fil de messages conseiller ↔ agriculteur, vu par le conseiller."""

    agriculteur = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.AGRICULTEUR)
    )
    agriculteur_nom = serializers.CharField(source='agriculteur.username', read_only=True)
    auteur_id = serializers.SerializerMethodField()
    auteur_nom = serializers.SerializerMethodField()

    class Meta:
        model = Recommandation
        fields = ('id', 'agriculteur', 'agriculteur_nom', 'campagne', 'type',
                  'titre', 'message', 'lue', 'date_creation',
                  'auteur_id', 'auteur_nom')
        read_only_fields = ('id', 'lue', 'date_creation', 'auteur_id', 'auteur_nom')

    def get_auteur_id(self, recommandation):
        # Les anciens messages (auteur null) ont été écrits par le conseiller.
        return recommandation.auteur_id or recommandation.conseiller_id

    def get_auteur_nom(self, recommandation):
        auteur = recommandation.auteur or recommandation.conseiller
        return auteur.get_full_name() or auteur.username

    def validate(self, attrs):
        agriculteur = attrs.get('agriculteur', getattr(self.instance, 'agriculteur', None))
        campagne = attrs.get('campagne', getattr(self.instance, 'campagne', None))
        if campagne and campagne.parcelle.agriculteur_id != agriculteur.id:
            raise serializers.ValidationError(
                {'campagne': "Cette campagne n'appartient pas à cet agriculteur."}
            )
        return attrs


class RecommandationRecueSerializer(serializers.ModelSerializer):
    """Fil de messages conseiller ↔ agriculteur, vu par l'agriculteur."""

    conseiller_nom = serializers.SerializerMethodField()
    auteur_id = serializers.SerializerMethodField()
    auteur_nom = serializers.SerializerMethodField()

    class Meta:
        model = Recommandation
        fields = ('id', 'conseiller', 'conseiller_nom', 'campagne', 'type',
                  'titre', 'message', 'lue', 'date_creation',
                  'auteur_id', 'auteur_nom')
        read_only_fields = fields

    def get_conseiller_nom(self, recommandation):
        conseiller = recommandation.conseiller
        return conseiller.get_full_name() or conseiller.username

    def get_auteur_id(self, recommandation):
        return recommandation.auteur_id or recommandation.conseiller_id

    def get_auteur_nom(self, recommandation):
        auteur = recommandation.auteur or recommandation.conseiller
        return auteur.get_full_name() or auteur.username
