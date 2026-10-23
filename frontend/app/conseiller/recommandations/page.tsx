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

// ── Add Recommandation modal ──────────────────────────────────

function AddRecommandationModal({ onClose, onCreated, agriculteurs }: { onClose: () => void; onCreated: () => void; agriculteurs: AgriculteurSuivi[] }) {
  const [form, setForm] = useState({ agriculteur: '', campagne: '', type: 'ACCOMPAGNEMENT', titre: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.agriculteur) { setError('Veuillez sélectionner un agriculteur.'); return; }
    setLoading(true); setError('');
    try {
      await api.conseiller.createRecommandation({
        agriculteur: Number(form.agriculteur),
        campagne: form.campagne ? Number(form.campagne) : null,
        type: form.type as 'ACCOMPAGNEMENT' | 'ANALYSE' | 'PREVENTION',
        titre: form.titre,
        message: form.message,
      });
      onCreated(); onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fermer" />
        <h2 className="modal-title">Nouvelle recommandation</h2>
        {error && <div className="error-state">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Agriculteur *</label>
            <select
              className="form-select"
              value={form.agriculteur}
              onChange={(e) => setForm({ ...form, agriculteur: e.target.value })}
              required
            >
              <option value="">Choisir un agriculteur</option>
              {agriculteurs.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.username}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Campagne</label>
            <select
              className="form-select"
              value={form.campagne}
              onChange={(e) => setForm({ ...form, campagne: e.target.value })}
            >
              <option value="">Choisir une campagne</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Type *</label>
            <select
              className="form-select"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="ACCOMPAGNEMENT">Accompagnement</option>
              <option value="ANALYSE">Analyse</option>
              <option value="PREVENTION">Prévention</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Titre *</label>
            <input
              className="form-input"
              required
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              placeholder="Titre de la recommandation"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Message *</label>
            <textarea
              className="form-textarea"
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Contenu de la recommandation..."
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-green" disabled={loading}>
              {loading ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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

      {showModal && (
        <AddRecommandationModal
          onClose={() => setShowModal(false)}
          onCreated={loadData}
          agriculteurs={agriculteurs}
        />
      )}
    </div>
  );
}
