import { useEffect, useMemo, useState } from 'react';
import { getMarkets } from '../api.js';

function Markets() {
  const [marches, setMarches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regionActive, setRegionActive] = useState('Toutes');
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    getMarkets()
      .then(setMarches)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const regions = useMemo(
    () => [...new Set(marches.map((m) => m.region))].sort(),
    [marches]
  );

  const filtres = useMemo(() => {
    const t = recherche.trim().toLowerCase();
    return marches.filter((m) => {
      const okRegion = regionActive === 'Toutes' || m.region === regionActive;
      const okSearch = !t || m.name.toLowerCase().includes(t);
      return okRegion && okSearch;
    });
  }, [marches, regionActive, recherche]);

  return (
    <main className="page">
      <div className="page-hero page-hero--compact">
        <h1>Marchés couverts</h1>
        <p>Marchés où les prix officiels sont suivis, classés par région.</p>
      </div>

      <div className="toolbar">
        <label className="search-field">
          <input
            type="search"
            placeholder="Rechercher un marché…"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </label>
        {!loading && !error && (
          <span className="toolbar__count">{filtres.length} marché{filtres.length > 1 ? 's' : ''}</span>
        )}
      </div>

      {!loading && !error && (
        <div className="filter-chips">
          <button type="button" className={regionActive === 'Toutes' ? 'chip chip--active' : 'chip'} onClick={() => setRegionActive('Toutes')}>Toutes</button>
          {regions.map((r) => (
            <button key={r} type="button" className={regionActive === r ? 'chip chip--active' : 'chip'} onClick={() => setRegionActive(r)}>{r}</button>
          ))}
        </div>
      )}

      {loading && <p className="loading-msg">Chargement…</p>}
      {error && <p className="error-msg">{error}</p>}
      {!loading && !error && filtres.length === 0 && (
        <p className="empty-state">Aucun marché trouvé.</p>
      )}
      {!loading && !error && filtres.length > 0 && (
        <div className="market-grid">
          {filtres.map((m) => (
            <article key={m.id} className="market-card">
              <h3 className="market-card__name">{m.name}</h3>
              <span className="market-card__region">{m.region}</span>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default Markets;
