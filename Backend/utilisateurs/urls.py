from django.urls import path

from .views import (
    AdminUserCreateView,
    AdminUserDetailView,
    AdminUserListView,
    AdminUserStatutView,
    AdminUserToggleActiveView,
    LoginView,
    LogoutView,
    MeView,
    RegisterView,
)

app_name = 'utilisateurs'

urlpatterns = [
    # Authentification
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/me/', MeView.as_view(), name='me'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),

    # Administration des utilisateurs
    path('admin/users/', AdminUserListView.as_view(), name='admin-users-list'),
    path('admin/users/create/', AdminUserCreateView.as_view(), name='admin-users-create'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-users-detail'),
    path('admin/users/<int:pk>/toggle-active/', AdminUserToggleActiveView.as_view(), name='admin-users-toggle-active'),
    path('admin/users/<int:pk>/statut/', AdminUserStatutView.as_view(), name='admin-users-statut'),
]
