from rest_framework import serializers

from .models import Campagne, Depense, Intervention, Parcelle, Recolte


class ParcelleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parcelle
        fields = ('id', 'nom', 'superficie', 'localisation', 'type_sol', 'date_creation')
        read_only_fields = ('id', 'date_creation')


class CampagneSerializer(serializers.ModelSerializer):
    parcelle_nom = serializers.CharField(source='parcelle.nom', read_only=True)

    class Meta:
        model = Campagne
        fields = ('id', 'parcelle', 'parcelle_nom', 'culture', 'date_debut', 'date_fin', 'statut')

    def validate_parcelle(self, parcelle):
        # L'agriculteur ne peut utiliser que ses propres parcelles
        if parcelle.agriculteur != self.context['request'].user:
            raise serializers.ValidationError("Parcelle introuvable.")
        return parcelle

    def validate(self, attrs):
        date_debut = attrs.get('date_debut', getattr(self.instance, 'date_debut', None))
        date_fin = attrs.get('date_fin', getattr(self.instance, 'date_fin', None))
        if date_debut and date_fin and date_fin < date_debut:
            raise serializers.ValidationError(
                {'date_fin': "La date de fin doit être après la date de début."}
            )
        return attrs


class CampagneLieeSerializer(serializers.ModelSerializer):
    """Base des éléments rattachés à une campagne de l'agriculteur."""

    def validate_campagne(self, campagne):
        if campagne.parcelle.agriculteur != self.context['request'].user:
            raise serializers.ValidationError("Campagne introuvable.")
        return campagne


class InterventionSerializer(CampagneLieeSerializer):
    class Meta:
        model = Intervention
        fields = ('id', 'campagne', 'type', 'date', 'description')


class DepenseSerializer(CampagneLieeSerializer):
    class Meta:
        model = Depense
        fields = ('id', 'campagne', 'categorie', 'montant', 'date', 'description')


class RecolteSerializer(CampagneLieeSerializer):
    class Meta:
        model = Recolte
        fields = ('id', 'campagne', 'date', 'quantite', 'unite')
