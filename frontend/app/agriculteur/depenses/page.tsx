'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Depense, Campagne } from '@/lib/types';
import { formatDate, formatFCFA } from '@/lib/utils';

// ── Delete confirmation modal ───────────────────────────────────

function DeleteConfirmModal({ onClose, onConfirm, itemName }: { onClose: () => void; onConfirm: () => void; itemName: string }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fermer"></button>
        <h2 className="modal-title">Confirmer la suppression</h2>
        <p style={{ marginBottom: 20, color: 'var(--text)', lineHeight: 1.5 }}>
          Êtes-vous sûr de vouloir supprimer <strong>{itemName}</strong> ? Cette action est irréversible.
        </p>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button type="button" className="btn-delete" onClick={onConfirm}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}

// ── Labels ────────────────────────────────────────────────────

const CATEGORIE_LABELS: Record<string, string> = {
  SEMENCES:   'Semences',
  MAIN_OEUVRE: "Main-d'œuvre",
  ENGRAIS:    'Engrais',
  TRAITEMENT: 'Traitement',
  AUTRE:      'Autre',
};

// ── Modal ajout ───────────────────────────────────────────────

function AddDepenseModal({
  onClose,
  onCreated,
  campagnes,
}: {
  onClose: () => void;
  onCreated: () => void;
  campagnes: Campagne[];
}) {
  const [form, setForm] = useState({
    campagne: '',
    categorie: 'SEMENCES',
    montant: '',
    date: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.campagne) { setError('Veuillez sélectionner une campagne.'); return; }
    setLoading(true); setError('');
    try {
      await api.agriculteur.createDepense({
        campagne: Number(form.campagne),
        categorie: form.categorie as 'SEMENCES' | 'MAIN_OEUVRE' | 'ENGRAIS' | 'TRAITEMENT' | 'AUTRE',
        montant: Number(form.montant),
        date: form.date,
        description: form.description,
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
        <h2 className="modal-title">Nouvelle dépense</h2>
        {error && <div className="error-state">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Campagne </label>
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
            <label className="form-label">Catégorie *</label>
            <select
              className="form-select"
              value={form.categorie}
              onChange={(e) => setForm({ ...form, categorie: e.target.value })}
            >
              <option value="SEMENCES">Semences</option>
              <option value="MAIN_OEUVRE">Main-d&apos;œuvre</option>
              <option value="ENGRAIS">Engrais</option>
              <option value="TRAITEMENT">Traitement</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Montant (FCFA) *</label>
              <input
                className="form-input"
                type="number"
                min="0"
                required
                value={form.montant}
                onChange={(e) => setForm({ ...form, montant: e.target.value })}
                placeholder="Ex : 25000"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                className="form-input"
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Détails sur la dépense..."
            />
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

type FilterType = 'TOUTES' | 'SEMENCES' | 'MAIN_OEUVRE' | 'ENGRAIS' | 'TRAITEMENT' | 'AUTRE';

export default function DepensesPage() {
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [campagnes, setCampagnes] = useState<Campagne[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterType>('TOUTES');
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [deps, camps] = await Promise.all([
        api.agriculteur.getDepenses(),
        api.agriculteur.getCampagnes(),
      ]);
      // Du plus récent au plus ancien
      setDepenses(deps.sort((a, b) => b.date.localeCompare(a.date)));
      setCampagnes(camps);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les dépenses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = depenses.filter((d) =>
    filter === 'TOUTES' ? true : d.categorie === filter
  );

  const totalFiltered = filtered.reduce((sum, d) => sum + Number(d.montant), 0);
  const campagneMap = Object.fromEntries(campagnes.map((c) => [c.id, c]));

  const handleDelete = async (id: number) => {
    try {
      await api.agriculteur.deleteDepense(id);
      setDepenses(depenses.filter((d) => d.id !== id));
      setDeleteId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  };

  return (
    <div className="page-container">
      <div className="section-header">
        <h1 className="page-title">Dépenses</h1>
        <button className="btn btn-green" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter
        </button>
      </div>

      {/* Carte total */}
      {!loading && depenses.length > 0 && (
        <div className="stat-banner">
          <div className="stat-banner-item">
            <span className="stat-banner-label">Total général</span>
            <span className="stat-banner-value stat-banner-value--red">
              {formatFCFA(depenses.reduce((s, d) => s + Number(d.montant), 0))}
            </span>
          </div>
          {filter !== 'TOUTES' && (
            <div className="stat-banner-item">
              <span className="stat-banner-label">{CATEGORIE_LABELS[filter]}</span>
              <span className="stat-banner-value stat-banner-value--red">{formatFCFA(totalFiltered)}</span>
            </div>
          )}
        </div>
      )}

      {error && <div className="error-state">{error}</div>}

      {/* Filtres */}
      <div className="filter-tabs">
        {(['TOUTES', 'SEMENCES', 'MAIN_OEUVRE', 'ENGRAIS', 'TRAITEMENT', 'AUTRE'] as FilterType[]).map((f) => (
          <button
            key={f}
            className={`filter-tab${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'TOUTES' ? 'Toutes' : CATEGORIE_LABELS[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-text">
            Aucune dépense{filter !== 'TOUTES' ? ' dans cette catégorie' : ''}
          </div>
          <div className="empty-state-sub">
            {filter === 'TOUTES'
              ? 'Enregistrez votre première dépense.'
              : 'Modifiez le filtre pour voir d\'autres dépenses.'}
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Catégorie</th>
                <th>Campagne</th>
                <th>Parcelle</th>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Montant</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const camp = campagneMap[d.campagne];
                return (
                  <tr key={d.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(d.date)}</td>
                    <td>
                      <span className="badge badge-gray">
                        {CATEGORIE_LABELS[d.categorie] || d.categorie}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{camp?.culture || `Campagne #${d.campagne}`}</td>
                    <td style={{ color: 'var(--muted)' }}>
                      {camp?.parcelle_nom || (camp ? `Parcelle #${camp.parcelle}` : '—')}
                    </td>
                    <td style={{ color: d.description ? 'var(--text)' : 'var(--muted)' }}>
                      {d.description || '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {formatFCFA(Number(d.montant))}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn-delete"
                        onClick={() => setDeleteId(d.id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} style={{ fontWeight: 700 }}>
                  Total {filter !== 'TOUTES' ? CATEGORIE_LABELS[filter] : ''}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#b91c1c', whiteSpace: 'nowrap' }}>
                  {formatFCFA(totalFiltered)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {showModal && (
        <AddDepenseModal
          key="depense-modal"
          onClose={() => setShowModal(false)}
          onCreated={loadData}
          campagnes={campagnes}
        />
      )}

      {deleteId && (
        <DeleteConfirmModal
          onClose={() => setDeleteId(null)}
          onConfirm={() => handleDelete(deleteId)}
          itemName={`la dépense de ${formatFCFA(Number(depenses.find((d) => d.id === deleteId)?.montant || 0))}`}
        />
      )}
    </div>
  );
}
