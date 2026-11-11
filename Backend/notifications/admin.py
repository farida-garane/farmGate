from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('titre', 'user', 'type', 'lue', 'date_creation')
    list_filter = ('type', 'lue')
    search_fields = ('titre', 'user__username')
    ordering = ('-date_creation',)
