import Link from 'next/link';

/* ── Icône Feuille du badge Logo FarmGate ────────────────────────── */
function IconLogoLeaf() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1b5e20"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  );
}

/* ── Flèche pour le bouton Commencer ─────────────────────────────── */
function IconArrowRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/* ── Icône 1 : Parcelles (Map pliée) ─────────────────────────────── */
function IconMap() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

/* ── Icône 2 : Campagnes (Layers superposés) ─────────────────────── */
function IconLayers() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

/* ── Icône 3 : Conseils (Bulle de discussion ronde) ──────────────── */
function IconMessageCircle() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="landing-wrapper">
      {/* ── PARTIE HAUTE (HERO) — Fond Vert ──────────────────────── */}
      <section className="landing-hero-section">
        {/* Navigation */}
        <header className="landing-nav">
          <Link href="/" className="landing-logo">
            <span className="landing-logo-badge">
              <IconLogoLeaf />
            </span>
            <span className="landing-logo-text">FarmGate</span>
          </Link>

          <div className="landing-nav-actions">
            <Link href="/login" className="landing-btn-nav-login">
              Connexion
            </Link>
            <Link href="/register" className="landing-btn-nav-register">
              S'inscrire
            </Link>
          </div>
        </header>

        {/* Contenu Hero */}
        <div className="landing-hero-content">
          <p className="landing-eyebrow">
            POUR LES AGRICULTEURS ET LEURS CONSEILLERS
          </p>

          <h1 className="landing-title">
            Votre exploitation,<br className="landing-br-mobile" /> suivie<br className="landing-br-desktop" /> simplement
          </h1>

          <p className="landing-subtitle">
            <span className="landing-sub-desktop">
              Parcelles, campagnes, dépenses, récoltes et conseils : tout<br /> au même endroit.
            </span>
            <span className="landing-sub-mobile">
              Parcelles, campagnes, dépenses,<br /> récoltes et conseils au même endroit.
            </span>
          </p>

          <div className="landing-cta-group">
            <Link href="/register" className="landing-btn-primary">
              <span>Commencer</span>
              <IconArrowRight />
            </Link>
            <Link href="/login" className="landing-btn-secondary">
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* ── PARTIE BASSE (FONCTIONNALITÉS) — Fond Blanc ─────────── */}
      <section className="landing-features-section">
        <div className="landing-features-grid">
          {/* Bloc 1 : Parcelles */}
          <div className="landing-feature-card">
            <div className="landing-feature-circle">
              <IconMap />
            </div>
            <div className="landing-feature-content">
              <h3 className="landing-feature-title">Parcelles</h3>
              <p className="landing-feature-desc landing-feature-desc-desktop">
                Gérez vos terrains et leurs cultures.
              </p>
              <p className="landing-feature-desc-mobile">
                Vos terrains et cultures.
              </p>
            </div>
          </div>

          {/* Bloc 2 : Campagnes */}
          <div className="landing-feature-card">
            <div className="landing-feature-circle">
              <IconLayers />
            </div>
            <div className="landing-feature-content">
              <h3 className="landing-feature-title">Campagnes</h3>
              <p className="landing-feature-desc landing-feature-desc-desktop">
                Suivez interventions, dépenses et récoltes.
              </p>
              <p className="landing-feature-desc-mobile">
                Dépenses et récoltes.
              </p>
            </div>
          </div>

          {/* Bloc 3 : Conseils */}
          <div className="landing-feature-card">
            <div className="landing-feature-circle">
              <IconMessageCircle />
            </div>
            <div className="landing-feature-content">
              <h3 className="landing-feature-title">Conseils</h3>
              <p className="landing-feature-desc landing-feature-desc-desktop">
                Recevez les recommandations de votre conseiller.
              </p>
              <p className="landing-feature-desc-mobile">
                Ceux de votre conseiller.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="landing-footer">
          © 2026 FarmGate
        </footer>
      </section>
    </div>
  );
}
