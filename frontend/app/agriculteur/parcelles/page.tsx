'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Parcelle, Campagne } from '@/lib/types';
import { formatDate } from '@/lib/utils';

// ── Add-Parcelle modal ────────────────────────────────────────

function AddParcelleModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ nom: '', superficie: '', localisation: '', type_sol: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.agriculteur.createParcelle({
        nom: form.nom,
        superficie: Number(form.superficie),
        localisation: form.localisation,
        type_sol: form.type_sol,
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
        <h2 className="modal-title">Ajouter une parcelle</h2>
        {error && <div className="error-state">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nom de la parcelle </label>
            <input
              className="form-input"
              required
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              placeholder="Ex : Champ nord"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Superficie (ha) *</label>
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.superficie}
              onChange={(e) => setForm({ ...form, superficie: e.target.value })}
              placeholder="Ex : 2.5"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Localisation *</label>
            <input
              className="form-input"
              required
              value={form.localisation}
              onChange={(e) => setForm({ ...form, localisation: e.target.value })}
              placeholder="Village, commune..."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Type de sol </label>
            <input
              className="form-input"
              required
              value={form.type_sol}
              onChange={(e) => setForm({ ...form, type_sol: e.target.value })}
              placeholder="Ex : Argileux, Limoneux..."
            />
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

// ── Parcelles table ────────────────────────────────────────────

function ParcellesTable({ parcelles }: { parcelles: Parcelle[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [campagnesMap, setCampagnesMap] = useState<Record<number, Campagne[]>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function toggleExpand(parcelle: Parcelle) {
    if (expanded === parcelle.id) {
      setExpanded(null);
      return;
    }
    setExpanded(parcelle.id);
    if (!campagnesMap[parcelle.id]) {
      setLoadingId(parcelle.id);
      try {
        const data = await api.agriculteur.getCampagnes(parcelle.id);
        setCampagnesMap((prev) => ({ ...prev, [parcelle.id]: data }));
      } catch {
        setCampagnesMap((prev) => ({ ...prev, [parcelle.id]: [] }));
      } finally {
        setLoadingId(null);
      }
    }
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Localisation</th>
            <th>Type de sol</th>
            <th style={{ textAlign: 'right' }}>Superficie (ha)</th>
            <th>Date de création</th>
            <th style={{ textAlign: 'center' }}>Campagnes</th>
          </tr>
        </thead>
        <tbody>
          {parcelles.map((p) => (
            <React.Fragment key={p.id}>
              <tr className="table-row-clickable" onClick={() => toggleExpand(p)}>
                <td style={{ fontWeight: 700 }}>{p.nom}</td>
                <td>{p.localisation}</td>
                <td>{p.type_sol}</td>
                <td style={{ textAlign: 'right' }}>{Number(p.superficie).toLocaleString('fr-FR')}</td>
                <td>{formatDate(p.date_creation)}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className="table-expand-btn">
                    {expanded === p.id ? '▲ Masquer' : '▼ Voir'}
                  </span>
                </td>
              </tr>
              {expanded === p.id && (
                <tr key={`${p.id}-expanded`} className="table-row-expanded">
                  <td colSpan={6}>
                    {loadingId === p.id ? (
                      <span style={{ color: 'var(--muted)', fontSize: 13 }}>Chargement...</span>
                    ) : !campagnesMap[p.id] || campagnesMap[p.id].length === 0 ? (
                      <span style={{ color: 'var(--muted)', fontSize: 13 }}>Aucune campagne pour cette parcelle.</span>
                    ) : (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {campagnesMap[p.id].map((c) => (
                          <span
                            key={c.id}
                            className="campagne-chip"
                            onClick={(e) => { e.stopPropagation(); router.push(`/agriculteur/campagnes/${c.id}`); }}
                          >
                            {c.culture}
                            <span className={`badge ${c.statut === 'EN_COURS' ? 'badge-green' : 'badge-gray'}`} style={{ marginLeft: 6, fontSize: 11 }}>
                              {c.statut === 'EN_COURS' ? 'En cours' : 'Terminée'}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function ParcellesPage() {
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const loadParcelles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.agriculteur.getParcelles();
      setParcelles(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les parcelles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadParcelles(); }, [loadParcelles]);

  return (
    <div className="page-container">
      <div className="section-header">
        <h1 className="page-title">Mes parcelles</h1>
        <button className="btn btn-green" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter une parcelle
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}

      {loading ? (
        <div className="loading-spinner"><div className="spinner-ring" /> Chargement des parcelles...</div>
      ) : parcelles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-text">Aucune parcelle pour le moment</div>
          <div className="empty-state-sub">Ajoutez votre première parcelle pour commencer.</div>
          <button className="btn btn-green" style={{ marginTop: 18 }} onClick={() => setShowModal(true)}>Ajouter une parcelle</button>
        </div>
      ) : (
        <ParcellesTable parcelles={parcelles} />
      )}

      {showModal && (
        <AddParcelleModal
          key="parcelle-modal"
          onClose={() => setShowModal(false)}
          onCreated={loadParcelles}
        />
      )}
    </div>
  );
}
