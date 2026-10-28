'use client';

import './admin.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';

/* ── Icônes SVG ───────────────────────────────────────────────── */
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
const IconUserPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="12" y1="5" x2="12" y2="13"/>
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

const NAV = [
  { href: '/admin',              label: 'Accueil',         icon: <IconHome /> },
  { href: '/admin/agriculteurs', label: 'Agriculteurs',   icon: <IconUsers /> },
  { href: '/admin/conseillers',  label: 'Conseillers',    icon: <IconUserPlus /> },
  { href: '/admin/profil',        label: 'Profil',         icon: <IconUser /> },
];

/* ─────────────────────────────────────────────────────────────────
   NavInner : isolé dans <Suspense> car il utilise usePathname()
   ───────────────────────────────────────────────────────────────── */
function NavInner() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/admin' ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`admin-nav-item${isActive(item.href) ? ' active' : ''}`}
        >
          <span className="admin-nav-icon">{item.icon}</span>
          <span className="admin-nav-label">{item.label}</span>
        </Link>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Layout principal
   ───────────────────────────────────────────────────────────────── */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">

      {/* ══ TOPBAR ══════════════════════════════════════════════ */}
      <header className="admin-topbar">
        <div className="admin-topbar-logo">
          <img src="/logo-farmgate.svg" alt="FarmGate" height={34} />
        </div>
        <div className="admin-topbar-actions">
          <Link href="/admin/profil" className="admin-topbar-profile">
            <span className="admin-topbar-profile-label">
              Administrateur
            </span>
            <IconChevron />
          </Link>
        </div>
      </header>

      {/* ══ CORPS : sidebar + contenu ════════════════════════════ */}
      <div className="admin-body">

        {/* Sidebar — NavInner dans Suspense pour usePathname() */}
        <aside className="admin-sidebar">
          <Suspense fallback={
            NAV.map((item) => (
              <span key={item.href} className="admin-nav-item">
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-label">{item.label}</span>
              </span>
            ))
          }>
            <NavInner />
          </Suspense>
        </aside>

        {/* Contenu principal */}
        <main className="admin-content">
          {children}
        </main>

      </div>
    </div>
  );
}
