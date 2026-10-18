from rest_framework.routers import DefaultRouter

from .views import (
    AgriculteurViewSet,
    CampagneViewSet,
    MesRecommandationsViewSet,
    ParcelleViewSet,
    RecommandationViewSet,
)

app_name = 'technicien'

router = DefaultRouter()
router.register('agriculteurs', AgriculteurViewSet, basename='agriculteur')
router.register('parcelles', ParcelleViewSet, basename='parcelle')
router.register('campagnes', CampagneViewSet, basename='campagne')
router.register('recommandations', RecommandationViewSet, basename='recommandation')
router.register('mes-recommandations', MesRecommandationsViewSet, basename='mes-recommandation')

urlpatterns = router.urls
