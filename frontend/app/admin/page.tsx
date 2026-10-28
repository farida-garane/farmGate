'use client';

import Link from 'next/link';

export default function AdminHomePage() {
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
            Voir les agriculteurs →
          </Link>
        </div>
      </div>
    </div>
  );
}
