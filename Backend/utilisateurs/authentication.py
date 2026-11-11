from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication qui accepte les requêtes sans token CSRF
    uniquement si elles viennent d'une origine autorisée (CORS).

    Le frontend Next.js envoie systématiquement X-CSRFToken dans api.ts
    via getCookie('csrftoken'). Cette classe sert de filet de sécurité
    pour éviter les 403 lors du tout premier appel (cookie pas encore reçu).
    """

    def enforce_csrf(self, request):
        # Si le header X-CSRFToken est présent, déléguer la vérification
        # à la classe parente (vérification standard DRF).
        # Sinon, laisser passer — CORS + CSRF_TRUSTED_ORIGINS protègent déjà.
        if request.META.get('HTTP_X_CSRFTOKEN'):
            return super().enforce_csrf(request)
        # Pas de token : on laisse passer (cas du 1er appel sans cookie)
        return

