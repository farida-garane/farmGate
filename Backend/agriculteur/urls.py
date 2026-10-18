from rest_framework.routers import DefaultRouter

from .views import (
    CampagneViewSet,
    DepenseViewSet,
    InterventionViewSet,
    ParcelleViewSet,
    RecolteViewSet,
)

app_name = 'agriculteur'

router = DefaultRouter()
router.register('parcelles', ParcelleViewSet, basename='parcelle')
router.register('campagnes', CampagneViewSet, basename='campagne')
router.register('interventions', InterventionViewSet, basename='intervention')
router.register('depenses', DepenseViewSet, basename='depense')
router.register('recoltes', RecolteViewSet, basename='recolte')

urlpatterns = router.urls
