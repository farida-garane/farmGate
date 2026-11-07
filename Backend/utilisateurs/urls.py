from django.urls import path

from .views import (
    LoginView,
    LogoutView,
    MeView,
    RegisterView,
    AdminUsersListView,
    AdminUserDetailView,
    AdminUserToggleActiveView,
    AdminUserCreateView,
    AdminUserChangeStatutView,
)

app_name = 'utilisateurs'

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/me/', MeView.as_view(), name='me'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    # Admin endpoints
    path('admin/users/', AdminUsersListView.as_view(), name='admin-users-list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:pk>/toggle-active/', AdminUserToggleActiveView.as_view(), name='admin-user-toggle-active'),
    path('admin/users/create/', AdminUserCreateView.as_view(), name='admin-user-create'),
    path('admin/users/<int:pk>/statut/', AdminUserChangeStatutView.as_view(), name='admin-user-change-statut'),
]
