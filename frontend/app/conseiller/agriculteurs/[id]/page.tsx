'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { AgriculteurSuivi, Parcelle, Campagne } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AgriculteurDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [agriculteur, setAgriculteur] = useState<AgriculteurSuivi | null>(null);
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [campagnes, setCampagnes] = useState<Campagne[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [agris, pars, camps] = await Promise.all([
        api.conseiller.getAgriculteurs(),
        api.conseiller.getParcelles(id),
        api.conseiller.getCampagnes({ agriculteur: id }),
      ]);
      const found = agris.find((a) => a.id === id) || null;
      setAgriculteur(found);
      setParcelles(pars);
      setCampagnes(camps);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger l\'agriculteur.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div></div>;
  if (error) return <div className="page-container"><div className="error-state">{error}</div></div>;
  if (!agriculteur) return <div className="page-container"><div className="empty-state"><div className="empty-state-text">Agriculteur introuvable.</div></div></div>;

  return (
    <div className="page-container">
      {/* Back */}
      <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => router.back()}>
        Retour
      </button>

      {/* Header */}
      <div className="campagne-header">
        <div>
          <h1 className="page-title">{agriculteur.username}</h1>
          <p className="page-subtitle">
            {agriculteur.first_name} {agriculteur.last_name}
            {agriculteur.localisation ? ` · ${agriculteur.localisation}` : ''}
          </p>
        </div>
      </div>

      {/* Infos */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>Informations</h2>
        <div className="profil-infos">
          <div className="profil-row">
            <span className="profil-label">Email</span>
            <span className="profil-value">{agriculteur.email || '-'}</span>
          </div>
          <div className="profil-row">
            <span className="profil-label">Téléphone</span>
            <span className="profil-value">{agriculteur.telephone || '-'}</span>
          </div>
        </div>
      </div>

      {/* Parcelles */}
      <section className="detail-section">
        <h2 className="section-title">Parcelles ({parcelles.length})</h2>
        {parcelles.length === 0 ? (
          <div className="empty-state-inline">Aucune parcelle enregistrée.</div>
        ) : (
          <div className="cards-grid">
            {parcelles.map((p) => (
              <div key={p.id} className="card">
                <div className="card-title">{p.nom}</div>
                <div className="card-meta">{p.localisation}</div>
                <div className="card-meta">{p.type_sol} · {Number(p.superficie).toLocaleString('fr-FR')} ha</div>
                <div className="card-meta">Créée le {formatDate(p.date_creation)}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Campagnes */}
      <section className="detail-section">
        <h2 className="section-title">Campagnes ({campagnes.length})</h2>
        {campagnes.length === 0 ? (
          <div className="empty-state-inline">Aucune campagne enregistrée.</div>
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
                {campagnes.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700 }}>{c.culture}</td>
                    <td>{c.parcelle_nom || `Parcelle #${c.parcelle}`}</td>
                    <td>
                      <span className={`badge ${c.statut === 'EN_COURS' ? 'badge-green' : 'badge-gray'}`}>
                        {c.statut === 'EN_COURS' ? 'En cours' : 'Terminée'}
                      </span>
                    </td>
                    <td>{formatDate(c.date_debut)}</td>
                    <td>{c.date_fin ? formatDate(c.date_fin) : <span style={{ color: 'var(--muted)' }}>-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
