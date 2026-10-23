'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Intervention, Campagne } from '@/lib/types';
import { formatDate } from '@/lib/utils';

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

const INTERVENTION_LABELS: Record<string, string> = {
  SEMIS:      'Semis',
  ENGRAIS:    'Engrais',
  TRAITEMENT: 'Traitement',
  AUTRE:      'Autre',
};

const TYPE_COLORS: Record<string, string> = {
  SEMIS:      'badge-green',
  ENGRAIS:    'badge-gold',
  TRAITEMENT: 'badge-blue',
  AUTRE:      'badge-gray',
};

// ── Modal ajout ───────────────────────────────────────────────

function AddInterventionModal({
  onClose,
  onCreated,
  campagnes,
}: {
  onClose: () => void;
  onCreated: () => void;
  campagnes: Campagne[];
}) {
  const [form, setForm] = useState({ campagne: '', type: 'SEMIS', date: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.campagne) { setError('Veuillez sélectionner une campagne.'); return; }
    setLoading(true); setError('');
    try {
      await api.agriculteur.createIntervention({
        campagne: Number(form.campagne),
        type: form.type as 'SEMIS' | 'ENGRAIS' | 'TRAITEMENT' | 'AUTRE',
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
        <h2 className="modal-title">Nouvelle intervention</h2>
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
            <label className="form-label">Type </label>
            <select
              className="form-select"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="SEMIS">Semis</option>
              <option value="ENGRAIS">Engrais</option>
              <option value="TRAITEMENT">Traitement</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date </label>
            <input
              className="form-input"
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Détails sur l'intervention..."
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

type FilterType = 'TOUTES' | 'SEMIS' | 'ENGRAIS' | 'TRAITEMENT' | 'AUTRE';

export default function InterventionsPage() {
  const router = useRouter();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [campagnes, setCampagnes] = useState<Campagne[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterType>('TOUTES');
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [intervs, camps] = await Promise.all([
        api.agriculteur.getInterventions(),
        api.agriculteur.getCampagnes(),
      ]);
      // Du plus récent au plus ancien
      setInterventions(intervs.sort((a, b) => b.date.localeCompare(a.date)));
      setCampagnes(camps);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les interventions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = interventions.filter((i) =>
    filter === 'TOUTES' ? true : i.type === filter
  );

  // Map campagne id → infos
  const campagneMap = Object.fromEntries(campagnes.map((c) => [c.id, c]));

  const handleDelete = async (id: number) => {
    try {
      await api.agriculteur.deleteIntervention(id);
      setInterventions(interventions.filter((i) => i.id !== id));
      setDeleteId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  };

  return (
    <div className="page-container">
      <div className="section-header">
        <h1 className="page-title">Interventions</h1>
        <button className="btn btn-green" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}

      {/* Filtres par type */}
      <div className="filter-tabs">
        {(['TOUTES', 'SEMIS', 'ENGRAIS', 'TRAITEMENT', 'AUTRE'] as FilterType[]).map((f) => (
          <button
            key={f}
            className={`filter-tab${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'TOUTES' ? 'Toutes' : INTERVENTION_LABELS[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-text">
            Aucune intervention{filter !== 'TOUTES' ? ' dans cette catégorie' : ''}
          </div>
          <div className="empty-state-sub">
            {filter === 'TOUTES'
              ? 'Ajoutez votre première intervention.'
              : 'Modifiez le filtre pour voir d\'autres interventions.'}
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Date</th>
                <th>Campagne</th>
                <th>Parcelle</th>
                <th>Description</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => {
                const camp = campagneMap[i.campagne];
                return (
                  <tr
                    key={i.id}
                    className="table-row-clickable"
                    onClick={() => camp && router.push(`/agriculteur/campagnes/${camp.id}`)}
                  >
                    <td>
                      <span className={`badge ${TYPE_COLORS[i.type] || 'badge-gray'}`}>
                        {INTERVENTION_LABELS[i.type] || i.type}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(i.date)}</td>
                    <td style={{ fontWeight: 600 }}>{camp?.culture || `Campagne #${i.campagne}`}</td>
                    <td style={{ color: 'var(--muted)' }}>
                      {camp?.parcelle_nom || (camp ? `Parcelle #${camp.parcelle}` : '—')}
                    </td>
                    <td style={{ color: i.description ? 'var(--text)' : 'var(--muted)' }}>
                      {i.description || '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn-delete"
                        onClick={(e) => { e.stopPropagation(); setDeleteId(i.id); }}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AddInterventionModal
          key="intervention-modal"
          onClose={() => setShowModal(false)}
          onCreated={loadData}
          campagnes={campagnes}
        />
      )}

      {deleteId && (
        <DeleteConfirmModal
          onClose={() => setDeleteId(null)}
          onConfirm={() => handleDelete(deleteId)}
          itemName={`l'intervention ${INTERVENTION_LABELS[interventions.find((i) => i.id === deleteId)?.type || '']}`}
        />
      )}
    </div>
  );
}
