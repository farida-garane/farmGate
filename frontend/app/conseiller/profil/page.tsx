'use client';

import { useEffect, useState } from 'react';
import type { User } from '@/lib/types';

export default function ProfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('farmgate_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

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
              <span className="profil-label">Email</span>
              <span className="profil-value">{user.email || '-'}</span>
            </div>
            <div className="profil-row">
              <span className="profil-label">Téléphone</span>
              <span className="profil-value">{user.telephone || '-'}</span>
            </div>
            <div className="profil-row">
              <span className="profil-label">Localisation</span>
              <span className="profil-value">{user.localisation || '-'}</span>
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