from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """/api/notifications/ : notifications de l'utilisateur connecté."""

    serializer_class = NotificationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)
        if self.request.query_params.get('non_lues') in ('1', 'true', 'True'):
            queryset = queryset.filter(lue=False)
        return queryset

    @action(detail=False, methods=['get'])
    def compteur(self, request):
        """GET /api/notifications/compteur/ : nombre de notifications non lues."""
        count = Notification.objects.filter(user=request.user, lue=False).count()
        return Response({'non_lues': count})

    @action(detail=True, methods=['post'])
    def lire(self, request, pk=None):
        """POST /api/notifications/<id>/lire/ : marque une notification comme lue."""
        notification = self.get_object()
        notification.lue = True
        notification.save(update_fields=['lue'])
        return Response(self.get_serializer(notification).data)

    @action(detail=False, methods=['post'], url_path='lire-tout')
    def lire_tout(self, request):
        """POST /api/notifications/lire-tout/ : marque toutes les notifications comme lues."""
        updated = Notification.objects.filter(user=request.user, lue=False).update(lue=True)
        return Response({'detail': f'{updated} notification(s) marquée(s) comme lue(s).', 'non_lues': 0})
