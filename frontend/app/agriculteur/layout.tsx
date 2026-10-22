'use client';

import './agri.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { api } from '@/lib/api';
import type { Recommandation } from '@/lib/types';

/* ── Icônes SVG ───────────────────────────────────────────────── */
const IconHome = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconMap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
);
const IconLayers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
  </svg>
);
const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
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
const IconTool = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>
  </svg>
);
const IconWallet = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
  </svg>
);
const IconSprout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/>
    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/>
    <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>
  </svg>
);
const IconClipboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <line x1="9" y1="12" x2="15" y2="12"/>
    <line x1="9" y1="16" x2="13" y2="16"/>
  </svg>
);

const NAV = [
  { href: '/agriculteur',                 label: 'Accueil',         icon: <IconHome /> },
  { href: '/agriculteur/parcelles',       label: 'Parcelles',       icon: <IconMap /> },
  { href: '/agriculteur/campagnes',       label: 'Campagnes',       icon: <IconLayers /> },
  { href: '/agriculteur/interventions',   label: 'Interventions',   icon: <IconTool /> },
  { href: '/agriculteur/depenses',        label: 'Dépenses',        icon: <IconWallet /> },
  { href: '/agriculteur/recoltes',        label: 'Récoltes',        icon: <IconSprout /> },
  { href: '/agriculteur/recommandations', label: 'Recommandations', icon: <IconClipboard /> },
  { href: '/agriculteur/profil',          label: 'Profil',          icon: <IconUser /> },
];

/* ─────────────────────────────────────────────────────────────────
   NavInner : isolé dans <Suspense> car il utilise usePathname()
   ───────────────────────────────────────────────────────────────── */
function NavInner({ hasUnread }: { hasUnread: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/agriculteur' ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`ag-nav-item${isActive(item.href) ? ' active' : ''}`}
        >
          <span className="ag-nav-icon">{item.icon}</span>
          <span className="ag-nav-label">{item.label}</span>
          {item.href === '/agriculteur/recommandations' && hasUnread && (
            <span className="ag-nav-dot" />
          )}
        </Link>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Layout principal
   ───────────────────────────────────────────────────────────────── */
export default function AgriculteurLayout({ children }: { children: React.ReactNode }) {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    api.agriculteur.getRecommandations()
      .then((r: Recommandation[]) => setHasUnread(r.some((x) => !x.lue)))
      .catch(() => {});
  }, []);

  return (
    <div className="ag-shell">

      {/* ══ TOPBAR ══════════════════════════════════════════════ */}
      <header className="ag-topbar">
        <div className="ag-topbar-logo">
          <img src="/logo-farmgate.svg" alt="FarmGate" height={34} />
        </div>
        <div className="ag-topbar-actions">
          <Link href="/agriculteur/recommandations" className="ag-topbar-icon" aria-label="Recommandations">
            <IconBell />
            {hasUnread && <span className="ag-badge-dot" />}
          </Link>
          <Link href="/agriculteur/profil" className="ag-topbar-profile">
            <span className="ag-topbar-profile-label">Profil</span>
            <IconChevron />
          </Link>
        </div>
      </header>

      {/* ══ CORPS : sidebar + contenu ════════════════════════════ */}
      <div className="ag-body">

        {/* Sidebar — NavInner dans Suspense pour usePathname() */}
        <aside className="ag-sidebar">
          <Suspense fallback={
            NAV.map((item) => (
              <span key={item.href} className="ag-nav-item">
                <span className="ag-nav-icon">{item.icon}</span>
                <span className="ag-nav-label">{item.label}</span>
              </span>
            ))
          }>
            <NavInner hasUnread={hasUnread} />
          </Suspense>
        </aside>

        {/* Contenu principal */}
        <main className="ag-content">
          {children}
        </main>

      </div>
    </div>
  );
}
