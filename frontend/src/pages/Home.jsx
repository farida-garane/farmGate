import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { getFloorPrices, getMarkets } from '../api.js';

function Home() {
  const [prix, setPrix] = useState([]);
  const [marches, setMarches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getFloorPrices(), getMarkets()])
      .then(([p, m]) => { setPrix(p); setMarches(m); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="home">
      <section className="hero">
        <div className="hero__bg" aria-hidden="true">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
        </div>
        <div className="hero__content">
          <span className="hero__badge">Prix officiels · Temps réel</span>
          <h1 className="hero__title">
            Farm<em>Gate</em>
          </h1>
          <p className="hero__text">
            FarmGate rend accessibles les prix planchers agricoles au Burkina Faso,
            pour que les producteurs sachent quel est le prix de référence avant d&apos;accepter une offre.
          </p>
          <div className="hero__actions">
            <Link to="/produits" className="btn btn--light">Consulter les prix</Link>
            <Link to="/marches" className="btn btn--outline-light">Trouver un marché</Link>
          </div>
        </div>
      </section>

      {error ? (
        <p className="error-msg page-section">{error}</p>
      ) : (
        <section className="stats">
          <article className="stat-card">
            <span className="stat-card__value">{loading ? '…' : prix.length}</span>
            <span className="stat-card__label">Produits suivis</span>
          </article>
          <article className="stat-card">
            <span className="stat-card__value">{loading ? '…' : marches.length}</span>
            <span className="stat-card__label">Marchés référencés</span>
          </article>
          <article className="stat-card stat-card--accent">
            <span className="stat-card__value">FCFA</span>
            <span className="stat-card__label">Prix planchers officiels</span>
          </article>
        </section>
      )}

      <section className="page-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Pourquoi FarmGate ?</h2>
            <p className="section-desc">L&apos;information au service de la négociation équitable</p>
          </div>
        </div>
        <div className="features">
          <article className="feature-card">
            <h3>Prix centralisés</h3>
            <p>Tous les prix planchers officiels au même endroit.</p>
          </article>
          <article className="feature-card">
            <h3>Meilleure négociation</h3>
            <p>Arrivez au marché avec une référence claire, pas au prix imposé.</p>
          </article>
          <article className="feature-card">
            <h3>Marchés par région</h3>
            <p>Repérez les marchés couverts, du Sahel au Sud-Ouest.</p>
          </article>
        </div>
      </section>

      <section className="page-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Prix en vedette</h2>
            <p className="section-desc">Les derniers prix planchers publiés</p>
          </div>
          <Link to="/produits" className="section-link">Voir tout →</Link>
        </div>
        {loading ? (
          <p className="loading-msg">Chargement…</p>
        ) : (
          <div className="product-grid">
            {prix.slice(0, 4).map((item) => (
              <ProductCard
                key={item.id}
                nom={item.product_name}
                prix={item.floor_price_fcfa_kg}
                date={item.effective_date}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Home;
