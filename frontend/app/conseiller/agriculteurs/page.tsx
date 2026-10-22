'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { AgriculteurSuivi } from '@/lib/types';

export default function AgriculteursPage() {
  const router = useRouter();
  const [agriculteurs, setAgriculteurs] = useState<AgriculteurSuivi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [localisation, setLocalisation] = useState('');

  const loadAgriculteurs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.conseiller.getAgriculteurs({
        search: search || undefined,
        localisation: localisation || undefined,
      });
      setAgriculteurs(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les agriculteurs.');
    } finally {
      setLoading(false);
    }
  }, [search, localisation]);

  useEffect(() => { loadAgriculteurs(); }, [loadAgriculteurs]);

  return (
    <div className="page-container">
      <div className="section-header">
        <h1 className="page-title">Mes agriculteurs</h1>
        <p className="page-subtitle">{agriculteurs.length} agriculteur{agriculteurs.length !== 1 ? 's' : ''} suivi{agriculteurs.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          className="form-input"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="Rechercher par nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          className="form-input"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="Filtrer par localisation..."
          value={localisation}
          onChange={(e) => setLocalisation(e.target.value)}
        />
      </div>

      {error && <div className="error-state">{error}</div>}

      {loading ? (
        <div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div>
      ) : agriculteurs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-text">Aucun agriculteur trouvé</div>
          <div className="empty-state-sub">Modifiez les filtres pour voir d'autres résultats.</div>
        </div>
      ) : (
        <div className="cards-grid">
          {agriculteurs.map((agri) => (
            <div
              key={agri.id}
              className="card card-clickable"
              onClick={() => router.push(`/conseiller/agriculteurs/${agri.id}`)}
            >
              <div className="card-title">{agri.username}</div>
              <div className="card-meta">{agri.first_name} {agri.last_name}</div>
              <div className="card-meta">{agri.localisation || 'Localisation non renseignée'}</div>
              <div className="card-meta">Téléphone: {agri.telephone || '—'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
