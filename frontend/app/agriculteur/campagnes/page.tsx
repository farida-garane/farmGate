'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Campagne, Parcelle } from '@/lib/types';
import { formatDate } from '@/lib/utils';

// ── Add-Campagne modal ────────────────────────────────────────

function AddCampagneModal({ onClose, onCreated, parcelles }: { onClose: () => void; onCreated: () => void; parcelles: Parcelle[] }) {
  const [form, setForm] = useState({ parcelle: '', culture: '', date_debut: '', date_fin: '', statut: 'EN_COURS' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.parcelle) { setError('Veuillez sélectionner une parcelle.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.agriculteur.createCampagne({
        parcelle: Number(form.parcelle),
        culture: form.culture,
        date_debut: form.date_debut,
        date_fin: form.date_fin || null,
        statut: form.statut as 'EN_COURS' | 'TERMINEE',
      });
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fermer"></button>
        <h2 className="modal-title">Nouvelle campagne</h2>
        {error && <div className="error-state">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Parcelle </label>
            <select className="form-select" value={form.parcelle} onChange={(e) => setForm({ ...form, parcelle: e.target.value })} required>
              <option value="">Sélectionner une parcelle</option>
              {parcelles.map((p) => (
                <option key={p.id} value={p.id}>{p.nom} - {p.localisation}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Culture </label>
            <input
              className="form-input"
              required
              value={form.culture}
              onChange={(e) => setForm({ ...form, culture: e.target.value })}
              placeholder="Ex : Maïs, Riz..."
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date de début </label>
              <input
                className="form-input"
                type="date"
                required
                value={form.date_debut}
                onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date de fin</label>
              <input
                className="form-input"
                type="date"
                value={form.date_fin}
                onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Statut </label>
            <select className="form-select" value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINEE">Terminée</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-green" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────

type FilterType = 'TOUTES' | 'EN_COURS' | 'TERMINEE';

export default function CampagnesPage() {
  const router = useRouter();
  const [campagnes, setCampagnes] = useState<Campagne[]>([]);
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterType>('TOUTES');
  const [showModal, setShowModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [c, p] = await Promise.all([
        api.agriculteur.getCampagnes(),
        api.agriculteur.getParcelles(),
      ]);
      setCampagnes(c);
      setParcelles(p);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les campagnes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = campagnes.filter((c) => {
    if (filter === 'TOUTES') return true;
    return c.statut === filter;
  });

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <h1 className="page-title">Mes campagnes</h1>
          <p className="page-subtitle">{campagnes.length} campagne{campagnes.length !== 1 ? 's' : ''} au total</p>
        </div>
        <button className="btn btn-green" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouvelle
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}

      {/* Filter tabs */}
      <div className="filter-tabs">
        {(['TOUTES', 'EN_COURS', 'TERMINEE'] as FilterType[]).map((f) => (
          <button
            key={f}
            className={`filter-tab${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'TOUTES' ? 'Toutes' : f === 'EN_COURS' ? 'En cours' : 'Terminées'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"></div>
          <div className="empty-state-text">Aucune campagne{filter !== 'TOUTES' ? ' dans cette catégorie' : ''}</div>
          <div className="empty-state-sub">
            {filter === 'TOUTES' ? 'Créez votre première campagne agricole.' : 'Modifiez le filtre pour voir d\'autres campagnes.'}
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Culture</th>
                <th>Parcelle</th>
                <th>Statut</th>
                <th>Début</th>
                <th>Fin</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((camp) => (
                <tr
                  key={camp.id}
                  className="table-row-clickable"
                  onClick={() => router.push(`/agriculteur/campagnes/${camp.id}`)}
                >
                  <td style={{ fontWeight: 700 }}>{camp.culture}</td>
                  <td>{camp.parcelle_nom || `Parcelle #${camp.parcelle}`}</td>
                  <td>
                    <span className={`badge ${camp.statut === 'EN_COURS' ? 'badge-green' : 'badge-gray'}`}>
                      {camp.statut === 'EN_COURS' ? 'En cours' : 'Terminée'}
                    </span>
                  </td>
                  <td>{formatDate(camp.date_debut)}</td>
                  <td>{camp.date_fin ? formatDate(camp.date_fin) : <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AddCampagneModal
          onClose={() => setShowModal(false)}
          onCreated={loadData}
          parcelles={parcelles}
        />
      )}
    </div>
  );
}
