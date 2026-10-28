'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

type AgriculteurAdmin = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  localisation?: string;
  is_active: boolean;
};

export default function AdminAgriculteursPage() {
  const [agriculteurs, setAgriculteurs] = useState<AgriculteurAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getAllUsers();
      const agriculteurs = data.filter((u: any) => u.role === 'AGRICULTEUR');
      setAgriculteurs(agriculteurs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les agriculteurs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = agriculteurs.filter((a) =>
    a.username.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    (a.localisation && a.localisation.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await api.admin.toggleUserActive(id);
      setAgriculteurs(agriculteurs.map((a) => 
        a.id === id ? { ...a, is_active: !a.is_active } : a
      ));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification.');
    }
  };

  const deleteAccount = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet agriculteur ?')) return;
    try {
      await api.admin.deleteUser(id);
      setAgriculteurs(agriculteurs.filter((a) => a.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  };

  return (
    <div>
      <h1 className="page-title">Agriculteurs</h1>

      {error && <div className="error-state">{error}</div>}

      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Rechercher par nom, email ou localisation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-text">Aucun agriculteur trouvé</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Localisation</th>
                <th>État du compte</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>
                    {a.first_name} {a.last_name}
                  </td>
                  <td>{a.email}</td>
                  <td>{a.localisation || '—'}</td>
                  <td>
                    <span className={`badge ${a.is_active ? 'badge-green' : 'badge-gray'}`}>
                      {a.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn-delete"
                      onClick={() => toggleActive(a.id, a.is_active)}
                      style={{ marginRight: '8px' }}
                    >
                      {a.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => deleteAccount(a.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
