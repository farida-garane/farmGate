'use client';

import './conseiller.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { api, ApiError } from '@/lib/api';
import type { Recommandation } from '@/lib/types';

/* ── Icônes SVG ───────────────────────────────────── */
const IconHome = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconMessage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconLogout = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const NAV = [
  { href: '/conseiller',               label: 'Accueil',         icon: <IconHome /> },
  { href: '/conseiller/agriculteurs',  label: 'Agriculteurs',   icon: <IconUsers /> },
  { href: '/conseiller/recommandations', label: 'Recommandations', icon: <IconMessage /> },
  { href: '/conseiller/profil',        label: 'Profil',          icon: <IconUser /> },
];

export default function ConseillerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hasUnread, setHasUnread] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Vérification de session : si non connecté ou mauvais rôle → /login
    api.auth.me()
      .then((u) => {
        if (u.role !== 'CONSEILLER' && !u.is_staff) {
          window.location.href = '/login';
          return;
        }
        localStorage.setItem('farmgate_user', JSON.stringify(u));
        const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || null;
        setUserName(name);
        setAuthChecked(true);
        // Charger les recommandations pour le badge
        api.conseiller.getRecommandations()
          .then((r: Recommandation[]) => setHasUnread(r.some((x) => !x.lue)))
          .catch(() => {});
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          localStorage.removeItem('farmgate_user');
        }
        window.location.href = '/login';
      });
  }, []);

  if (!authChecked) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Chargement...</div>;
  }

  const isActive = (href: string) =>
    href === '/conseiller' ? pathname === href : pathname.startsWith(href);

  return (
    <div className="co-shell">

      {/* ═══════════ TOPBAR ═══════════ */}
      <header className="co-topbar">
        {/* Logo */}
        <div className="co-topbar-logo">
          <img src="/logo-farmgate.svg" alt="FarmGate" height={34} />
        </div>

        {/* Actions droite */}
        <div className="co-topbar-actions">
          <div className="co-topbar-icon" aria-label="Notifications">
            <IconBell />
            {hasUnread && <span className="co-badge-dot" />}
          </div>
          <Link href="/conseiller/profil" className="co-topbar-profile">
            <span className="co-topbar-profile-label">
              {userName ?? 'Connexion'}
            </span>
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem('farmgate_user');
              window.location.href = '/login';
            }}
            className="co-topbar-icon"
            aria-label="Déconnexion"
            style={{
              cursor: 'pointer',
            }}
          >
            <IconLogout />
          </button>
        </div>
      </header>

      {/* ═══════════ CORPS ═══════════ */}
      <div className="co-body">

        {/* SIDEBAR */}
        <aside className="co-sidebar">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`co-nav-item${isActive(item.href) ? ' active' : ''}`}
            >
              <span className="co-nav-icon">{item.icon}</span>
              <span className="co-nav-label">{item.label}</span>
              {item.href === '/conseiller/recommandations' && hasUnread && (
                <span className="co-nav-dot" />
              )}
            </Link>
          ))}
        </aside>

        {/* CONTENU */}
        <main className="co-content">
          {children}
        </main>
      </div>
    </div>
  );
}
