from rest_framework import permissions, viewsets

from .models import Campagne, Depense, Intervention, Parcelle, Recolte
from .serializers import (
    CampagneSerializer,
    DepenseSerializer,
    InterventionSerializer,
    ParcelleSerializer,
    RecolteSerializer,
)


class IsAgriculteur(permissions.BasePermission):
    message = "Accès réservé aux agriculteurs."

    def has_permission(self, request, view):
        return bool(request.user.is_authenticated and request.user.is_agriculteur)


class ParcelleViewSet(viewsets.ModelViewSet):
    """/api/agriculteur/parcelles/ : les parcelles de l'agriculteur connecté."""

    serializer_class = ParcelleSerializer
    permission_classes = (IsAgriculteur,)

    def get_queryset(self):
        return Parcelle.objects.filter(agriculteur=self.request.user)

    def perform_create(self, serializer):
        serializer.save(agriculteur=self.request.user)


class CampagneViewSet(viewsets.ModelViewSet):
    """/api/agriculteur/campagnes/ (filtre : ?parcelle=<id>)"""

    serializer_class = CampagneSerializer
    permission_classes = (IsAgriculteur,)

    def get_queryset(self):
        queryset = Campagne.objects.filter(
            parcelle__agriculteur=self.request.user
        ).select_related('parcelle')
        parcelle = self.request.query_params.get('parcelle')
        if parcelle:
            queryset = queryset.filter(parcelle_id=parcelle)
        return queryset


class CampagneLieeViewSet(viewsets.ModelViewSet):
    """Base des éléments d'une campagne (filtre : ?campagne=<id>)."""

    model = None
    permission_classes = (IsAgriculteur,)

    def get_queryset(self):
        queryset = self.model.objects.filter(
            campagne__parcelle__agriculteur=self.request.user
        )
        campagne = self.request.query_params.get('campagne')
        if campagne:
            queryset = queryset.filter(campagne_id=campagne)
        return queryset


class InterventionViewSet(CampagneLieeViewSet):
    """/api/agriculteur/interventions/ : semis, engrais, traitements…"""

    model = Intervention
    serializer_class = InterventionSerializer


class DepenseViewSet(CampagneLieeViewSet):
    """/api/agriculteur/depenses/ : semences, main-d'œuvre…"""

    model = Depense
    serializer_class = DepenseSerializer


class RecolteViewSet(CampagneLieeViewSet):
    """/api/agriculteur/recoltes/ : quantités récoltées."""

    model = Recolte
    serializer_class = RecolteSerializer
