from django.contrib import admin

from .models import Campagne, Depense, Intervention, Parcelle, Recolte


@admin.register(Parcelle)
class ParcelleAdmin(admin.ModelAdmin):
    list_display = ('nom', 'agriculteur', 'superficie', 'localisation', 'type_sol')
    search_fields = ('nom', 'localisation', 'agriculteur__username')


class InterventionInline(admin.TabularInline):
    model = Intervention
    extra = 0


class DepenseInline(admin.TabularInline):
    model = Depense
    extra = 0


class RecolteInline(admin.TabularInline):
    model = Recolte
    extra = 0


@admin.register(Campagne)
class CampagneAdmin(admin.ModelAdmin):
    list_display = ('culture', 'parcelle', 'date_debut', 'date_fin', 'statut')
    list_filter = ('statut', 'culture')
    search_fields = ('culture', 'parcelle__nom', 'parcelle__agriculteur__username')
    inlines = (InterventionInline, DepenseInline, RecolteInline)
