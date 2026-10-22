'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Recommandation } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const TYPE_LABELS: Record<string, string> = {
  ACCOMPAGNEMENT: 'Accompagnement',
  ANALYSE: 'Analyse',
  PREVENTION: 'Prévention',
};

export default function RecommandationsPage() {
  const [recommandations, setRecommandations] = useState<Recommandation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await api.agriculteur.getRecommandations();
      // Du plus récent au plus ancien
      setRecommandations(data.sort((a, b) => b.date_creation.localeCompare(a.date_creation)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les recommandations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleLire(id: number) {
    try {
      await api.agriculteur.lireRecommandation(id);
      setRecommandations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, lue: true } : r))
      );
    } catch {
      // silently fail
    }
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Recommandations</h1>
        <p className="page-subtitle">
          {recommandations.filter((r) => !r.lue).length > 0
            ? `${recommandations.filter((r) => !r.lue).length} non lue(s)`
            : 'Tout est lu'}
        </p>
      </div>

      {error && <div className="error-state">{error}</div>}

      {loading ? (
        <div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div>
      ) : recommandations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-text">Aucune recommandation</div>
          <div className="empty-state-sub">Votre conseiller n&apos;a pas encore envoyé de recommandation.</div>
        </div>
      ) : (
        <div className="cards-grid" style={{ gridTemplateColumns: '1fr' }}>
          {recommandations.map((r) => (
            <div key={r.id} className={`card reco-card${r.lue ? ' reco-lue' : ''}`}>
              <div className="reco-header">
                <div>
                  <div className="card-title">{r.titre}</div>
                  <div className="card-meta" style={{ marginTop: 4 }}>
                    {TYPE_LABELS[r.type] || r.type}
                    {r.conseiller_nom ? `  ${r.conseiller_nom}` : ''}
                    {'  '}
                    {formatDate(r.date_creation)}
                  </div>
                </div>
                <span className={`badge ${r.lue ? 'badge-gray' : 'badge-gold'}`}>
                  {r.lue ? 'Lue' : 'Nouvelle'}
                </span>
              </div>
              <p className="reco-message">{r.message}</p>
              {!r.lue && (
                <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => handleLire(r.id)}>
                  Marquer comme lue
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
