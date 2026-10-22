'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Recolte, Campagne } from '@/lib/types';
import { formatDate } from '@/lib/utils';

// ── Labels ────────────────────────────────────────────────────

const UNITE_LABELS: Record<string, string> = {
  KG:    'kg',
  TONNE: 'Tonne',
  SAC:   'Sac',
};

// ── Modal ajout ───────────────────────────────────────────────

function AddRecolteModal({
  onClose,
  onCreated,
  campagnes,
}: {
  onClose: () => void;
  onCreated: () => void;
  campagnes: Campagne[];
}) {
  const [form, setForm] = useState({ campagne: '', date: '', quantite: '', unite: 'KG' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.campagne) { setError('Veuillez sélectionner une campagne.'); return; }
    setLoading(true); setError('');
    try {
      await api.agriculteur.createRecolte({
        campagne: Number(form.campagne),
        date: form.date,
        quantite: Number(form.quantite),
        unite: form.unite as 'KG' | 'TONNE' | 'SAC',
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
        <h2 className="modal-title">Nouvelle récolte</h2>
        {error && <div className="error-state">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Campagne *</label>
            <select
              className="form-select"
              value={form.campagne}
              onChange={(e) => setForm({ ...form, campagne: e.target.value })}
              required
            >
              <option value="">Sélectionner une campagne</option>
              {campagnes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.culture} - {c.parcelle_nom || `Parcelle #${c.parcelle}`}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date de récolte *</label>
            <input
              className="form-input"
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantité *</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.quantite}
                onChange={(e) => setForm({ ...form, quantite: e.target.value })}
                placeholder="Ex : 500"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unité *</label>
              <select
                className="form-select"
                value={form.unite}
                onChange={(e) => setForm({ ...form, unite: e.target.value })}
              >
                <option value="KG">Kilogramme (kg)</option>
                <option value="TONNE">Tonne</option>
                <option value="SAC">Sac</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-green" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────

export default function RecoltesPage() {
  const [recoltes, setRecoltes] = useState<Recolte[]>([]);
  const [campagnes, setCampagnes] = useState<Campagne[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterUnite, setFilterUnite] = useState<'TOUTES' | 'KG' | 'TONNE' | 'SAC'>('TOUTES');
  const [showModal, setShowModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [recs, camps] = await Promise.all([
        api.agriculteur.getRecoltes(),
        api.agriculteur.getCampagnes(),
      ]);
      // Du plus récent au plus ancien
      setRecoltes(recs.sort((a, b) => b.date.localeCompare(a.date)));
      setCampagnes(camps);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les récoltes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = recoltes.filter((r) =>
    filterUnite === 'TOUTES' ? true : r.unite === filterUnite
  );

  const campagneMap = Object.fromEntries(campagnes.map((c) => [c.id, c]));

  // Totaux par unité pour les campagnes filtrées
  const totauxParUnite: Record<string, number> = {};
  filtered.forEach((r) => {
    totauxParUnite[r.unite] = (totauxParUnite[r.unite] || 0) + Number(r.quantite);
  });

  return (
    <div className="page-container">
      <div className="section-header">
        <h1 className="page-title">Récoltes</h1>
        <button className="btn btn-green" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter
        </button>
      </div>

      {/* Bandeau totaux */}
      {!loading && recoltes.length > 0 && (
        <div className="stat-banner">
          {Object.entries(totauxParUnite).map(([unite, total]) => (
            <div key={unite} className="stat-banner-item">
              <span className="stat-banner-label">Total ({UNITE_LABELS[unite] || unite})</span>
              <span className="stat-banner-value stat-banner-value--green">
                {Number(total).toLocaleString('fr-FR')} {UNITE_LABELS[unite] || unite}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && <div className="error-state">{error}</div>}

      {/* Filtre par unité */}
      <div className="filter-tabs">
        {(['TOUTES', 'KG', 'TONNE', 'SAC'] as const).map((u) => (
          <button
            key={u}
            className={`filter-tab${filterUnite === u ? ' active' : ''}`}
            onClick={() => setFilterUnite(u)}
          >
            {u === 'TOUTES' ? 'Toutes' : UNITE_LABELS[u]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-text">Aucune récolte enregistrée</div>
          <div className="empty-state-sub">Ajoutez votre première récolte.</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Campagne</th>
                <th>Parcelle</th>
                <th style={{ textAlign: 'right' }}>Quantité</th>
                <th>Unité</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const camp = campagneMap[r.campagne];
                return (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(r.date)}</td>
                    <td style={{ fontWeight: 600 }}>{camp?.culture || `Campagne #${r.campagne}`}</td>
                    <td style={{ color: 'var(--muted)' }}>
                      {camp?.parcelle_nom || (camp ? `Parcelle #${camp.parcelle}` : '—')}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      {Number(r.quantite).toLocaleString('fr-FR')}
                    </td>
                    <td>
                      <span className="badge badge-green">
                        {UNITE_LABELS[r.unite] || r.unite}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {Object.entries(totauxParUnite).length > 0 && (
              <tfoot>
                {Object.entries(totauxParUnite).map(([unite, total]) => (
                  <tr key={unite}>
                    <td colSpan={3} style={{ fontWeight: 700 }}>
                      Total - {UNITE_LABELS[unite] || unite}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--green)', whiteSpace: 'nowrap' }}>
                      {Number(total).toLocaleString('fr-FR')}
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>
                      {UNITE_LABELS[unite] || unite}
                    </td>
                  </tr>
                ))}
              </tfoot>
            )}
          </table>
        </div>
      )}

      {showModal && (
        <AddRecolteModal
          key="recolte-modal"
          onClose={() => setShowModal(false)}
          onCreated={loadData}
          campagnes={campagnes}
        />
      )}
    </div>
  );
}
