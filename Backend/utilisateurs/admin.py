from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'username',
        'email',
        'first_name',
        'last_name',
        'role',
        'telephone',
        'localisation',
        'is_staff',
        'is_active',
    )
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active', 'date_joined')
    search_fields = ('username', 'first_name', 'last_name', 'email', 'telephone', 'localisation')
    ordering = ('-date_joined',)

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            'Informations Métier (FarmGate)',
            {
                'fields': ('role', 'telephone', 'localisation'),
            },
        ),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (
            'Informations Métier (FarmGate)',
            {
                'fields': ('role', 'telephone', 'localisation'),
            },
        ),
    )
