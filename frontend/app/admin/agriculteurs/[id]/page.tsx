'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

type AgriculteurDetail = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  telephone?: string;
  localisation?: string;
  date_creation: string;
  is_active: boolean;
};

export default function AgriculteurDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [agriculteur, setAgriculteur] = useState<AgriculteurDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAgriculteur = async () => {
      try {
        const data = await api.admin.getUserDetail(Number(params.id));
        if (data.role === 'AGRICULTEUR') {
          setAgriculteur(data);
        } else {
          setError('Agriculteur non trouvé');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    loadAgriculteur();
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
    if (!agriculteur) return;
    try {
      await api.admin.toggleUserActive(agriculteur.id);
      setAgriculteur({ ...agriculteur, is_active: !agriculteur.is_active });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification');
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div>;
  }

  if (error || !agriculteur) {
    return (
      <div>
        <button className="btn btn-ghost" onClick={() => router.back()} style={{ marginBottom: '16px' }}>
          ← Retour
        </button>
        <div className="error-state">{error || 'Agriculteur non trouvé'}</div>
      </div>
    );
  }

  return (
    <div>
      <button className="btn btn-ghost" onClick={() => router.back()} style={{ marginBottom: '24px' }}>
        ← Retour
      </button>

      <h1 className="page-title">Fiche Agriculteur</h1>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="form-group">
          <label className="form-label">Nom</label>
          <div className="form-value">{agriculteur.last_name}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Prénom</label>
          <div className="form-value">{agriculteur.first_name}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Nom d'utilisateur</label>
          <div className="form-value">{agriculteur.username}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <div className="form-value">{agriculteur.email}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Téléphone</label>
          <div className="form-value">{agriculteur.telephone || '—'}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Localité</label>
          <div className="form-value">{agriculteur.localisation || '—'}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Date d'inscription</label>
          <div className="form-value">{formatDate(agriculteur.date_creation)}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Statut</label>
          <span className={`badge ${agriculteur.is_active ? 'badge-green' : 'badge-gray'}`}>
            {agriculteur.is_active ? 'Actif' : 'Désactivé'}
          </span>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
          <button
            className={`btn ${agriculteur.is_active ? 'btn-orange' : 'btn-green'}`}
            onClick={toggleActive}
          >
            {agriculteur.is_active ? 'Désactiver le compte' : 'Activer le compte'}
          </button>
        </div>
      </div>
    </div>
  );
}
