'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { formatDate } from '@/lib/utils';

type DernierUser = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: 'AGRICULTEUR' | 'CONSEILLER';
  is_staff: boolean;
  is_active: boolean;
  statut?: 'ACTIF' | 'INACTIF';
  date_creation: string;
};

const ROLE_LABELS: Record<string, string> = {
  AGRICULTEUR: 'Agriculteur',
  CONSEILLER: 'Conseiller',
};

function nomComplet(u: DernierUser): string {
  return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username;
}

function roleLabel(u: DernierUser): string {
  return u.is_staff ? 'Administrateur' : ROLE_LABELS[u.role] || u.role;
}

/* ── Icônes SVG ───────────────────────────────────────────────── */
const IconUserPlus = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="12" y1="5" x2="12" y2="13"/>
  </svg>
);
const IconUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconList = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const QUICK_ACTIONS = [
  { label: 'Ajouter un agriculteur', href: '/admin/agriculteurs?ajouter=1', icon: <IconUserPlus /> },
  { label: 'Ajouter un conseiller', href: '/admin/conseillers?ajouter=1', icon: <IconUserPlus /> },
  { label: 'Voir tous les agriculteurs', href: '/admin/agriculteurs', icon: <IconUsers /> },
  { label: 'Voir tous les conseillers', href: '/admin/conseillers', icon: <IconList /> },
];

export default function AdminHomePage() {
  const [users, setUsers] = useState<DernierUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin
      .getAllUsers()
      .then((data: DernierUser[]) => setUsers(data.slice(0, 5)))
      .catch((err: unknown) =>
        setError(err instanceof ApiError ? err.message : 'Impossible de charger les utilisateurs.')
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="admin-dashboard-hero">
        <div className="admin-dashboard-hero-text">
          <h1 className="admin-dashboard-hello">Bienvenue</h1>
          <p className="admin-dashboard-subtitle">
            dans votre espace administrateur
          </p>
          <p className="admin-dashboard-desc">
            Gérez les agriculteurs et les conseillers agricoles depuis un seul endroit.
          </p>
        </div>
        <div className="admin-dashboard-actions">
          <Link href="/admin/agriculteurs" className="admin-btn admin-btn-primary">
            Explorer mon espace
          </Link>
        </div>
      </div>

      {/* ── Accès rapides ── */}
      <section className="admin-dash-section">
        <div className="section-header">
          <div>
            <h2 className="admin-section-title">Accès rapides</h2>
            <p className="page-subtitle">Actions fréquentes</p>
          </div>
        </div>
        <div className="admin-quick-grid">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.label} href={action.href} className="admin-quick-card">
              <span className="admin-quick-icon">{action.icon}</span>
              <span className="admin-quick-label">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Derniers utilisateurs inscrits ── */}
      <section className="admin-dash-section">
        <div className="section-header">
          <div>
            <h2 className="admin-section-title">Derniers utilisateurs inscrits</h2>
          </div>
        </div>

        {error && <div className="error-state">{error}</div>}

        {loading ? (
          <div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-text">Aucun utilisateur</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Rôle</th>
                  <th>Date d&apos;inscription</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const actif = u.statut ? u.statut === 'ACTIF' : u.is_active;
                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{nomComplet(u)}</td>
                      <td>{roleLabel(u)}</td>
                      <td>{u.date_creation ? formatDate(u.date_creation) : '—'}</td>
                      <td>
                        <span className={`badge ${actif ? 'badge-green' : 'badge-gray'}`}>
                          {actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
