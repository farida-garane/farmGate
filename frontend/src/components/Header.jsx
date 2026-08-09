import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="header">
      <div className="header__inner">
        <NavLink to="/" className="header__brand">
          <span className="header__logo" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
              <path d="M16 6C16 6 10 12 10 18C10 21.3 12.7 24 16 24C19.3 24 22 21.3 22 18C22 12 16 6 16 6Z" fill="currentColor" />
              <path d="M16 24V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <span className="header__title">FarmGate</span>
            <span className="header__subtitle">Burkina Faso</span>
          </div>
        </NavLink>

        <nav className="header__nav">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>
            Accueil
          </NavLink>
          <NavLink to="/produits" className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>
            Prix
          </NavLink>
          <NavLink to="/marches" className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>
            Marchés
          </NavLink>
        </nav>

        <div className="header__actions">
          {user ? (
            <div className="header__user">
              <span className="header__user-name">{user.full_name}</span>
              <button type="button" className="btn btn--ghost btn--sm" onClick={handleLogout}>
                Déconnexion
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="btn btn--primary btn--sm">
              Connexion
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
