'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Campagne, Intervention, Depense, Recolte } from '@/lib/types';
import { formatDate, formatFCFA } from '@/lib/utils';

// ── Type icons ───────────────────────────────────────────────

const INTERVENTION_LABELS: Record<string, string> = {
  SEMIS: 'Semis',
  ENGRAIS: 'Engrais',
  TRAITEMENT: 'Traitement',
  AUTRE: 'Autre',
};

const DEPENSE_LABELS: Record<string, string> = {
  SEMENCES: 'Semences',
  MAIN_OEUVRE: "Main-d'œuvre",
  ENGRAIS: 'Engrais',
  TRAITEMENT: 'Traitement',
  AUTRE: 'Autre',
};

// ── Add modals ───────────────────────────────────────────────

function AddInterventionModal({ campagneId, onClose, onCreated }: { campagneId: number; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ type: 'SEMIS', date: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.agriculteur.createIntervention({ campagne: campagneId, type: form.type as 'SEMIS' | 'ENGRAIS' | 'TRAITEMENT' | 'AUTRE', date: form.date, description: form.description });
      onCreated(); onClose();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Erreur.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}></button>
        <h2 className="modal-title">Nouvelle intervention</h2>
        {error && <div className="error-state">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Type </label>
            <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="SEMIS">Semis</option>
              <option value="ENGRAIS">Engrais</option>
              <option value="TRAITEMENT">Traitement</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date </label>
            <input className="form-input" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Détails..." />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-green" disabled={loading}>{loading ? 'Enregistrement...' : 'Ajouter'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddDepenseModal({ campagneId, onClose, onCreated }: { campagneId: number; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ categorie: 'SEMENCES', montant: '', date: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.agriculteur.createDepense({ campagne: campagneId, categorie: form.categorie as 'SEMENCES' | 'MAIN_OEUVRE' | 'ENGRAIS' | 'TRAITEMENT' | 'AUTRE', montant: Number(form.montant), date: form.date, description: form.description });
      onCreated(); onClose();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Erreur.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}></button>
        <h2 className="modal-title">Nouvelle dépense</h2>
        {error && <div className="error-state">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Catégorie *</label>
            <select className="form-select" value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })}>
              <option value="SEMENCES">Semences</option>
              <option value="MAIN_OEUVRE">Main-d&apos;œuvre</option>
              <option value="ENGRAIS">Engrais</option>
              <option value="TRAITEMENT">Traitement</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Montant (FCFA) *</label>
            <input className="form-input" type="number" min="0" required value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input className="form-input" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Détails..." />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-green" disabled={loading}>{loading ? 'Enregistrement...' : 'Ajouter'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddRecolteModal({ campagneId, onClose, onCreated }: { campagneId: number; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ date: '', quantite: '', unite: 'KG' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.agriculteur.createRecolte({ campagne: campagneId, date: form.date, quantite: Number(form.quantite), unite: form.unite as 'KG' | 'TONNE' | 'SAC' });
      onCreated(); onClose();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Erreur.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}></button>
        <h2 className="modal-title">Nouvelle récolte</h2>
        {error && <div className="error-state">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input className="form-input" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantité *</label>
              <input className="form-input" type="number" min="0" step="0.01" required value={form.quantite} onChange={(e) => setForm({ ...form, quantite: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Unité *</label>
              <select className="form-select" value={form.unite} onChange={(e) => setForm({ ...form, unite: e.target.value })}>
                <option value="KG">kg</option>
                <option value="TONNE">Tonne</option>
                <option value="SAC">Sac</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-green" disabled={loading}>{loading ? 'Enregistrement...' : 'Ajouter'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────

type ModalType = 'intervention' | 'depense' | 'recolte' | null;

function CampagneDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [campagne, setCampagne] = useState<Campagne | null>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [recoltes, setRecoltes] = useState<Recolte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<ModalType>(null);

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [camps, intervs, deps, recs] = await Promise.all([
        api.agriculteur.getCampagnes(),
        api.agriculteur.getInterventions(id),
        api.agriculteur.getDepenses(id),
        api.agriculteur.getRecoltes(id),
      ]);
      const found = camps.find((c) => c.id === id) || null;
      setCampagne(found);
      setInterventions(intervs);
      setDepenses(deps);
      setRecoltes(recs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger la campagne.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const totalDepenses = depenses.reduce((s, d) => s + Number(d.montant), 0);
  const sorted = [...interventions].sort((a, b) => a.date.localeCompare(b.date));

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div></div>;
  if (error) return <div className="page-container"><div className="error-state">{error}</div></div>;
  if (!campagne) return <div className="page-container"><div className="empty-state"><div className="empty-state-text">Campagne introuvable.</div></div></div>;

  return (
    <div className="page-container">
      {/* Back */}
      <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => router.back()}>
        Retour
      </button>

      {/* Header */}
      <div className="campagne-header">
        <div>
          <h1 className="page-title">{campagne.culture}</h1>
          <p className="page-subtitle">
            {campagne.parcelle_nom || `Parcelle #${campagne.parcelle}`}
            {formatDate(campagne.date_debut)}
            {campagne.date_fin ? ` ${formatDate(campagne.date_fin)}` : ''}
          </p>
        </div>
        <span className={`badge ${campagne.statut === 'EN_COURS' ? 'badge-green' : 'badge-gray'}`}>
          {campagne.statut === 'EN_COURS' ? 'En cours' : 'Terminée'}
        </span>
      </div>

      {/* Quick add buttons */}
      <div className="quick-actions" style={{ marginBottom: 28 }}>
        <button className="quick-action-btn" onClick={() => setModal('intervention')}>+ Intervention</button>
        <button className="quick-action-btn" onClick={() => setModal('depense')}>+ Dépense</button>
        <button className="quick-action-btn" onClick={() => setModal('recolte')}>+ Récolte</button>
      </div>

      {/* Interventions */}
      <section className="detail-section">
        <h2 className="section-title">Interventions</h2>
        {sorted.length === 0 ? (
          <div className="empty-state-inline">Aucune intervention enregistrée.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <span className="badge badge-green" style={{ fontWeight: 600 }}>
                        {INTERVENTION_LABELS[i.type] || i.type}
                      </span>
                    </td>
                    <td>{formatDate(i.date)}</td>
                    <td style={{ color: i.description ? 'var(--text)' : 'var(--muted)' }}>
                      {i.description || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Dépenses */}
      <section className="detail-section">
        <h2 className="section-title">Dépenses</h2>
        {depenses.length === 0 ? (
          <div className="empty-state-inline">Aucune dépense enregistrée.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Catégorie</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {depenses.map((d) => (
                  <tr key={d.id}>
                    <td>{formatDate(d.date)}</td>
                    <td>{DEPENSE_LABELS[d.categorie] || d.categorie}</td>
                    <td>{d.description || '-'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatFCFA(Number(d.montant))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ fontWeight: 700 }}>Total</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--green)' }}>{formatFCFA(totalDepenses)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {/* Récoltes */}
      <section className="detail-section">
        <h2 className="section-title">Récoltes</h2>
        {recoltes.length === 0 ? (
          <div className="empty-state-inline">Aucune récolte enregistrée.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Quantité</th>
                  <th>Unité</th>
                </tr>
              </thead>
              <tbody>
                {recoltes.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDate(r.date)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      {Number(r.quantite).toLocaleString('fr-FR')}
                    </td>
                    <td>{r.unite}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={1} style={{ fontWeight: 700 }}>Total récolté</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--green)' }}>
                    {recoltes.reduce((s, r) => s + Number(r.quantite), 0).toLocaleString('fr-FR')}
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>unités mixtes</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {/* Bilan */}
      <section className="detail-section">
        <h2 className="section-title">Bilan</h2>
        <div className="bilan-card">
          <div className="bilan-row">
            <span>Total dépenses</span>
            <span className="bilan-value-red">{formatFCFA(totalDepenses)}</span>
          </div>
          <div className="bilan-row">
            <span>Quantité récoltée</span>
            <span className="bilan-value-green">
              {recoltes.reduce((s, r) => s + Number(r.quantite), 0).toLocaleString('fr-FR')} unités
            </span>
          </div>
        </div>
      </section>

      {/* Modals */}
      {modal === 'intervention' && <AddInterventionModal key="intervention-modal" campagneId={id} onClose={() => setModal(null)} onCreated={loadData} />}
      {modal === 'depense' && <AddDepenseModal key="depense-modal" campagneId={id} onClose={() => setModal(null)} onCreated={loadData} />}
      {modal === 'recolte' && <AddRecolteModal key="recolte-modal" campagneId={id} onClose={() => setModal(null)} onCreated={loadData} />}
    </div>
  );
}

export default function CampagneDetailPage() {
  return (
    <Suspense fallback={<div className="page-container"><div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div></div>}>
      <CampagneDetailContent />
    </Suspense>
  );
}
