'use client';

import { useEffect, useState } from 'react';

export default function AdminProfilPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = localStorage.getItem('farmgate_user');
        if (stored) {
          const userData = JSON.parse(stored);
          setUser(userData);
        }
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div>;
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
          <span className="profil-value">Administrateur</span>
        </div>
      </div>
    </div>
  );
}
