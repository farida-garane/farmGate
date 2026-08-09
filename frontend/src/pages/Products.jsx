import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import { getFloorPrices } from '../api.js';

function Products() {
  const [prix, setPrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    getFloorPrices()
      .then(setPrix)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtres = useMemo(() => {
    const t = recherche.trim().toLowerCase();
    if (!t) return prix;
    return prix.filter((p) => p.product_name.toLowerCase().includes(t));
  }, [prix, recherche]);

  return (
    <main className="page">
      <div className="page-hero page-hero--compact">
        <h1>Prix des produits</h1>
        <p>Prix planchers officiels en FCFA par kilogramme.</p>
      </div>

      <div className="toolbar">
        <label className="search-field">
          <input
            type="search"
            placeholder="Rechercher un produit…"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </label>
        {!loading && !error && (
          <span className="toolbar__count">{filtres.length} produit{filtres.length > 1 ? 's' : ''}</span>
        )}
      </div>

      {loading && <p className="loading-msg">Chargement…</p>}
      {error && <p className="error-msg">{error}</p>}
      {!loading && !error && filtres.length === 0 && (
        <p className="empty-state">Aucun produit trouvé.</p>
      )}
      {!loading && !error && filtres.length > 0 && (
        <div className="product-grid">
          {filtres.map((item) => (
            <ProductCard
              key={item.id}
              nom={item.product_name}
              prix={item.floor_price_fcfa_kg}
              date={item.effective_date}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default Products;
