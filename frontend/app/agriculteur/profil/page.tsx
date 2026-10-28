'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import type { User } from '@/lib/types';

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Affichage immédiat depuis le localStorage (évite le flash vide)
    try {
      const stored = localStorage.getItem('farmgate_user');
      if (stored) setUser(JSON.parse(stored));
    } catch { /* ignore */ }
    setLoading(false); // On affiche tout de suite ce qu'on a

    // 2. Synchronisation avec le serveur pour avoir les données à jour
    api.auth.me()
      .then((u) => {
        setUser(u);
        localStorage.setItem('farmgate_user', JSON.stringify(u));
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) {
          // Session expirée → redirection vers la connexion
          localStorage.removeItem('farmgate_user');
          router.push('/login');
        }
      });
  }, [router]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title" style={{ marginBottom: 24 }}>Mon profil</h1>

      <div className="card">
        {user ? (
          <div className="profil-infos">
            <div className="profil-row">
              <span className="profil-label">Prénom</span>
              <span className="profil-value">{user.first_name || '-'}</span>
            </div>
            <div className="profil-row">
              <span className="profil-label">Nom</span>
              <span className="profil-value">{user.last_name || '-'}</span>
            </div>
            <div className="profil-row">
              <span className="profil-label">Nom d'utilisateur</span>
              <span className="profil-value">{user.username}</span>
            </div>
            <div className="profil-row">
              <span className="profil-label">Téléphone</span>
              <span className="profil-value">{user.telephone || '-'}</span>
            </div>
            <div className="profil-row">
              <span className="profil-label">Localité</span>
              <span className="profil-value">{user.Localité || '-'}</span>
            </div>
            <div className="profil-row">
              <span className="profil-label">Mot de passe</span>
              <span className="profil-value"></span>
            </div>
          </div>
        ) : (
          <div className="empty-state-inline">Informations non disponibles. Reconnectez-vous.</div>
        )}
      </div>
    </div>
  );
}