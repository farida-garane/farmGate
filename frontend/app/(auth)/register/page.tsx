'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    telephone: '',
    localisation: '',
    role: 'AGRICULTEUR',
    password: '',
    password2: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.password2) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);

    try {
      const user = await api.auth.register({
        ...formData,
        role: formData.role as 'AGRICULTEUR' | 'CONSEILLER',
      });
      localStorage.setItem('farmgate_user', JSON.stringify(user));
      if (user.role === 'CONSEILLER') {
        window.location.href = '/conseiller';
      } else {
        window.location.href = '/agriculteur';
      }
    } catch (err) {
      if (err instanceof ApiError && typeof err.data === 'object' && err.data !== null) {
        const entries = Object.entries(err.data as Record<string, string[]>);
        if (entries.length > 0) {
          setError(`${entries[0][0]} : ${entries[0][1][0]}`);
        } else {
          setError(err.message);
        }
      } else {
        setError("Erreur lors de l'inscription.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="auth-title">Inscription</h1>
      <p className="auth-subtitle">Créez votre compte sur FarmGate</p>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Prénom</label>
            <input
              type="text"
              name="first_name"
              className="form-input"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Nom</label>
            <input
              type="text"
              name="last_name"
              className="form-input"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Nom d'utilisateur</label>
          <input
            type="text"
            name="username"
            className="form-input"
            value={formData.username}
            onChange={handleChange}
            required
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Rôle</label>
          <select
            name="role"
            className="form-select"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="AGRICULTEUR">Agriculteur</option>
            <option value="CONSEILLER">Conseiller agricole</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Téléphone</label>
            <input
              type="tel"
              name="telephone"
              className="form-input"
              value={formData.telephone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Localité</label>
            <input
              type="text"
              name="localisation"
              className="form-input"
              value={formData.localisation}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Mot de passe</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
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

        <div className="form-group">
          <label className="form-label">Confirmer le mot de passe</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword2 ? 'text' : 'password'}
              name="password2"
              className="form-input"
              value={formData.password2}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword2(!showPassword2)}
              aria-label={showPassword2 ? "Masquer la confirmation du mot de passe" : "Afficher la confirmation du mot de passe"}
              tabIndex={-1}
            >
              {showPassword2 ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? 'Inscription en cours...' : "S'inscrire"}
        </button>
      </form>

      <div className="auth-footer">
        Déjà un compte ?
        <Link href="/login" className="auth-link">
          Se connecter
        </Link>
      </div>
    </div>
  );
}
