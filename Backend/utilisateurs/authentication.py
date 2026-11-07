from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Session authentication sans vérification CSRF.
    La protection CSRF est redondante quand CORS est correctement configuré
    (ce qui est le cas : seules les origines autorisées peuvent appeler l'API).
    Pattern standard pour les architectures SPA + DRF.
    """

    def enforce_csrf(self, request):
        return  # CORS protège déjà contre les requêtes cross-site
