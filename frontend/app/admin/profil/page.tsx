'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { roleLabel } from '@/lib/utils';

export default function AdminProfilPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setError(err.message || 'Erreur lors du chargement du profil.');
        } else {
          setError('Erreur inconnue.');
        }
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  if (!user) {
    return <div className="error-state">Impossible de charger le profil.</div>;
  }

  return (
    <div>
      <h1 className="page-title">Mon profil</h1>
      <p className="page-subtitle">Informations de votre compte administrateur</p>

      <div className="profil-infos" style={{ marginTop: '24px' }}>
        <div className="profil-row">
          <span className="profil-label">Nom d&apos;utilisateur</span>
          <span className="profil-value">{user.username}</span>
        </div>
        <div className="profil-row">
          <span className="profil-label">Email</span>
          <span className="profil-value">{user.email}</span>
        </div>
        <div className="profil-row">
          <span className="profil-label">Prénom</span>
          <span className="profil-value">{user.first_name || '—'}</span>
        </div>
        <div className="profil-row">
          <span className="profil-label">Nom</span>
          <span className="profil-value">{user.last_name || '—'}</span>
        </div>
        <div className="profil-row">
          <span className="profil-label">Rôle</span>
          <span className="profil-value">{roleLabel(user)}</span>
        </div>
        <div className="profil-row">
          <span className="profil-label">Téléphone</span>
          <span className="profil-value">{user.telephone || '—'}</span>
        </div>
        <div className="profil-row">
          <span className="profil-label">Localisation</span>
          <span className="profil-value">{user.localisation || '—'}</span>
        </div>
        <div className="profil-row">
          <span className="profil-label">Mot de passe</span>
          <span className="profil-value">••••••••</span>
        </div>
      </div>
    </div>
  );
}
