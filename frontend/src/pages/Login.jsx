import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { login, authLoading, authError } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(phone, password);
      navigate('/');
    } catch {
      /* erreur gérée par AuthContext */
    }
  }

  return (
    <main className="page login-page">
      <div className="login-card">
        <div className="login-card__header">
          <div className="login-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1>Connexion</h1>
          <p>Espace réservé aux agents et contributeurs pour mettre à jour les prix.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {authError && (
            <div className="form-error" role="alert">{authError}</div>
          )}

          <label className="form-field">
            <span>Numéro de téléphone</span>
            <input
              type="tel"
              placeholder="+226 70 00 00 00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
            />
          </label>

          <label className="form-field">
            <span>Mot de passe</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          <button type="submit" className="btn btn--primary btn--full" disabled={authLoading}>
            {authLoading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default Login;
