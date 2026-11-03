'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

type ConseillerDetail = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  telephone?: string;
  localisation?: string;
  date_creation: string;
  is_active: boolean;
  agriculteurs_suivis?: number;
};

export default function ConseillerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [conseiller, setConseiller] = useState<ConseillerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadConseiller = async () => {
      try {
        const data = await api.admin.getUserDetail(Number(params.id));
        if (data.role === 'CONSEILLER') {
          setConseiller(data);
        } else {
          setError('Conseiller non trouvé');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    loadConseiller();
  }, [params.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleActive = async () => {
    if (!conseiller) return;
    try {
      await api.admin.toggleUserActive(conseiller.id);
      setConseiller({ ...conseiller, is_active: !conseiller.is_active });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification');
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div>;
  }

  if (error || !conseiller) {
    return (
      <div>
        <button className="btn btn-ghost" onClick={() => router.back()} style={{ marginBottom: '16px' }}>
          ← Retour
        </button>
        <div className="error-state">{error || 'Conseiller non trouvé'}</div>
      </div>
    );
  }

  return (
    <div>
      <button className="btn btn-ghost" onClick={() => router.back()} style={{ marginBottom: '24px' }}>
        ← Retour
      </button>

      <h1 className="page-title">Fiche Conseiller</h1>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="form-group">
          <label className="form-label">Nom</label>
          <div className="form-value">{conseiller.last_name}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Prénom</label>
          <div className="form-value">{conseiller.first_name}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Nom d'utilisateur</label>
          <div className="form-value">{conseiller.username}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <div className="form-value">{conseiller.email}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Téléphone</label>
          <div className="form-value">{conseiller.telephone || '—'}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Localité</label>
          <div className="form-value">{conseiller.localisation || '—'}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Date d'inscription</label>
          <div className="form-value">{formatDate(conseiller.date_creation)}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Agriculteurs suivis</label>
          <div className="form-value">{conseiller.agriculteurs_suivis || 0}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Statut</label>
          <span className={`badge ${conseiller.is_active ? 'badge-green' : 'badge-gray'}`}>
            {conseiller.is_active ? 'Actif' : 'Désactivé'}
          </span>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
          <button
            className={`btn ${conseiller.is_active ? 'btn-orange' : 'btn-green'}`}
            onClick={toggleActive}
          >
            {conseiller.is_active ? 'Désactiver le compte' : 'Activer le compte'}
          </button>
        </div>
      </div>
    </div>
  );
}
