'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Recommandation, AgriculteurSuivi } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const TYPE_LABELS: Record<string, string> = {
  ACCOMPAGNEMENT: 'Accompagnement',
  ANALYSE: 'Analyse',
  PREVENTION: 'Prévention',
};

export default function RecommandationsPage() {
  const [recommandations, setRecommandations] = useState<Recommandation[]>([]);
  const [agriculteurs, setAgriculteurs] = useState<AgriculteurSuivi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [recs, agris] = await Promise.all([
        api.conseiller.getRecommandations(),
        api.conseiller.getAgriculteurs(),
      ]);
      setRecommandations(recs.sort((a, b) => b.date_creation.localeCompare(a.date_creation)));
      setAgriculteurs(agris);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les recommandations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="page-container">
      <div className="section-header">
        <h1 className="page-title">Recommandations</h1>
        <button className="btn btn-green" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouvelle recommandation
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}

      {loading ? (
        <div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div>
      ) : recommandations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-text">Aucune recommandation envoyée</div>
          <div className="empty-state-sub">Envoyez votre première recommandation à un agriculteur.</div>
        </div>
      ) : (
        <div className="cards-grid" style={{ gridTemplateColumns: '1fr' }}>
          {recommandations.map((r) => {
            const agri = agriculteurs.find((a) => a.id === r.agriculteur);
            return (
              <div key={r.id} className={`card reco-card${r.lue ? ' reco-lue' : ''}`}>
                <div className="reco-header">
                  <div>
                    <div className="card-title">{r.titre}</div>
                    <div className="card-meta" style={{ marginTop: 4 }}>
                      {TYPE_LABELS[r.type] || r.type}
                      {agri ? ` · ${agri.username}` : ''}
                      {' · '}
                      {formatDate(r.date_creation)}
                    </div>
                  </div>
                  <span className={`badge ${r.lue ? 'badge-gray' : 'badge-gold'}`}>
                    {r.lue ? 'Lue' : 'Non lue'}
                  </span>
                </div>
                <p className="reco-message">{r.message}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
