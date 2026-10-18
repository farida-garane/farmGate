from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from agriculteur.models import Campagne, Parcelle
from agriculteur.views import IsAgriculteur

from .models import Recommandation
from .serializers import (
    AgriculteurSerializer,
    CampagneConseillerSerializer,
    ParcelleConseillerSerializer,
    RecommandationRecueSerializer,
    RecommandationSerializer,
)

User = get_user_model()


class IsConseiller(permissions.BasePermission):
    message = "Accès réservé aux conseillers agricoles."

    def has_permission(self, request, view):
        return bool(request.user.is_authenticated and request.user.is_conseiller)


# --- Suivi et analyse des agriculteurs (lecture seule) -----------------------

class AgriculteurViewSet(viewsets.ReadOnlyModelViewSet):
    """/api/conseiller/agriculteurs/ (filtres : ?localisation=, ?search=)"""

    serializer_class = AgriculteurSerializer
    permission_classes = (IsConseiller,)

    def get_queryset(self):
        queryset = User.objects.filter(role=User.Role.AGRICULTEUR).annotate(
            nb_parcelles=Count('parcelles')
        )
        params = self.request.query_params
        if params.get('localisation'):
            queryset = queryset.filter(localisation__icontains=params['localisation'])
        if params.get('search'):
            search = params['search']
            queryset = queryset.filter(
                Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )
        return queryset


class ParcelleViewSet(viewsets.ReadOnlyModelViewSet):
    """/api/conseiller/parcelles/ (filtre : ?agriculteur=<id>)"""

    serializer_class = ParcelleConseillerSerializer
    permission_classes = (IsConseiller,)

    def get_queryset(self):
        queryset = Parcelle.objects.all()
        agriculteur = self.request.query_params.get('agriculteur')
        if agriculteur:
            queryset = queryset.filter(agriculteur_id=agriculteur)
        return queryset


class CampagneViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/conseiller/campagnes/ : campagnes avec interventions, dépenses et récoltes.

    Filtres : ?agriculteur=<id>, ?parcelle=<id>, ?statut=EN_COURS, ?culture=maïs
    """

    serializer_class = CampagneConseillerSerializer
    permission_classes = (IsConseiller,)

    def get_queryset(self):
        queryset = Campagne.objects.select_related('parcelle').prefetch_related(
            'interventions', 'depenses', 'recoltes'
        )
        params = self.request.query_params
        if params.get('agriculteur'):
            queryset = queryset.filter(parcelle__agriculteur_id=params['agriculteur'])
        if params.get('parcelle'):
            queryset = queryset.filter(parcelle_id=params['parcelle'])
        if params.get('statut'):
            queryset = queryset.filter(statut=params['statut'].upper())
        if params.get('culture'):
            queryset = queryset.filter(culture__icontains=params['culture'])
        return queryset


# --- Recommandations ---------------------------------------------------------

class RecommandationViewSet(viewsets.ModelViewSet):
    """/api/conseiller/recommandations/ : recommandations envoyées par le conseiller."""

    serializer_class = RecommandationSerializer
    permission_classes = (IsConseiller,)

    def get_queryset(self):
        queryset = Recommandation.objects.filter(
            conseiller=self.request.user
        ).select_related('agriculteur')
        agriculteur = self.request.query_params.get('agriculteur')
        if agriculteur:
            queryset = queryset.filter(agriculteur_id=agriculteur)
        return queryset

    def perform_create(self, serializer):
        serializer.save(conseiller=self.request.user)


class MesRecommandationsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/conseiller/mes-recommandations/ : côté agriculteur, les recommandations reçues.
    POST .../<id>/lire/ marque la recommandation comme lue.
    """

    serializer_class = RecommandationRecueSerializer
    permission_classes = (IsAgriculteur,)

    def get_queryset(self):
        return Recommandation.objects.filter(
            agriculteur=self.request.user
        ).select_related('conseiller')

    @action(detail=True, methods=['post'])
    def lire(self, request, pk=None):
        recommandation = self.get_object()
        recommandation.lue = True
        recommandation.save(update_fields=['lue'])
        return Response(self.get_serializer(recommandation).data)
