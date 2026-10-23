'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';

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

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const user = await api.auth.register(formData);
      if (user.role === 'CONSEILLER') {
        router.push('/conseiller');
      } else {
        router.push('/agriculteur');
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
          <label className="form-label">Adresse e-mail</label>
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
          <label className="form-label">Rôle </label>
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
            <label className="form-label">Localisation</label>
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
          <input
            type="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirmer le mot de passe</label>
          <input
            type="password"
            name="password2"
            className="form-input"
            value={formData.password2}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
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
