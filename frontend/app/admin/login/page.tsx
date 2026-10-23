'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await api.auth.login({ username, password });
      if (user.role === 'ADMIN') {
        router.push('/admin');
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
          <label className="form-label">Nom d'utilisateur</label>
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
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
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
