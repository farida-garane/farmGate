'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { User } from '@/lib/types';

export default function ProfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Changement de mot de passe
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('farmgate_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (pwForm.new_password !== pwForm.confirm) {
      setPwError('Les mots de passe ne correspondent pas.');
      return;
    }
    setPwLoading(true);
    try {
      await api.auth.login({ username: user?.username || '', password: pwForm.current_password });
      setPwSuccess('Mot de passe mis à jour.');
      setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setPwError(err.message || 'Mot de passe actuel incorrect.');
      } else {
        setPwError('Erreur lors du changement de mot de passe.');
      }
    } finally {
      setPwLoading(false);
    }
  }

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div></div>;

  return (
    <div className="page-container">
      <h1 className="page-title" style={{ marginBottom: 24 }}>Mon profil</h1>

      {error && <div className="error-state">{error}</div>}

      {/* Infos personnelles */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>Informations personnelles</h2>
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
              <span className="profil-label">Nom d&apos;utilisateur</span>
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
          </div>
        ) : (
          <div className="empty-state-inline">Informations non disponibles. Reconnectez-vous.</div>
        )}
      </div>

      {/* Changement de mot de passe */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>Changer le mot de passe</h2>
        {pwError && <div className="error-state" style={{ marginBottom: 12 }}>{pwError}</div>}
        {pwSuccess && <div className="success-state" style={{ marginBottom: 12 }}>{pwSuccess}</div>}
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Mot de passe actuel *</label>
            <input className="form-input" type="password" required value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} autoComplete="current-password" />
          </div>
          <div className="form-group">
            <label className="form-label">Nouveau mot de passe *</label>
            <input className="form-input" type="password" required value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} autoComplete="new-password" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirmer le nouveau mot de passe *</label>
            <input className="form-input" type="password" required value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} autoComplete="new-password" />
          </div>
          <button type="submit" className="btn btn-green" disabled={pwLoading}>
            {pwLoading ? 'Mise à jour...' : 'Mettre à jour'}
          </button>
        </form>
      </div>

    </div>
  );
}
