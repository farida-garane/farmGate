'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';

function IconEye() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // ── Vérifie si l'utilisateur est déjà connecté ──────────────
  useEffect(() => {
    api.auth.me()
      .then((u) => {
        if (u.is_staff) {
          // Session active et admin → redirige directement vers /admin
          window.location.href = '/admin';
        } else {
          // Session active mais pas admin → reste sur la page login
          setCheckingSession(false);
        }
      })
      .catch(() => {
        // Pas de session valide → affiche le formulaire
        setCheckingSession(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await api.auth.login({ username, password });
      // Seuls les comptes is_staff (créés via Django) peuvent accéder à l'admin
      if (user.is_staff) {
        localStorage.setItem('farmgate_user', JSON.stringify(user));
        window.location.href = '/admin';
      } else {
        setError('Accès réservé aux administrateurs.');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (typeof err.data === 'object' && err.data !== null && 'non_field_errors' in err.data) {
          setError((err.data as { non_field_errors: string[] }).non_field_errors[0]);
        } else {
          setError(err.message || 'Identifiants incorrects.');
        }
      } else {
        setError('Erreur de connexion.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Pendant la vérification de session → spinner discret
  if (checkingSession) {
    return (
      <div className="auth-wrapper">
        <div className="loading-spinner"><div className="spinner-ring" /> Vérification de session...</div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <img src="/logo-farmgate.svg" alt="FarmGate" width={120} className="auth-logo" />
        <div className="auth-card">
          <h1 className="auth-title">Connexion Administrateur</h1>
          <p className="auth-subtitle">Accès réservé au personnel administratif</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nom d&apos;utilisateur ou Email</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  tabIndex={-1}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <div className="auth-footer">
          </div>
        </div>
      </div>
    </div>
  );
}
