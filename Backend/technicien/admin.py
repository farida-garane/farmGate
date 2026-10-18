from django.contrib import admin

from .models import Recommandation


@admin.register(Recommandation)
class RecommandationAdmin(admin.ModelAdmin):
    list_display = ('titre', 'type', 'conseiller', 'agriculteur', 'campagne', 'lue', 'date_creation')
    list_filter = ('type', 'lue', 'date_creation')
    search_fields = ('titre', 'message', 'conseiller__username', 'agriculteur__username')
