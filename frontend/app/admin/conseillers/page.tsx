'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

type ConseillerAdmin = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  agriculteurs_suivis?: number;
};

export default function AdminConseillersPage() {
  const [conseillers, setConseillers] = useState<ConseillerAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getAllUsers();
      const conseillers = data.filter((u: any) => u.role === 'CONSEILLER');
      setConseillers(conseillers);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les conseillers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.auth.register({
        ...formData,
        role: 'CONSEILLER',
        password2: formData.password,
      });
      setShowModal(false);
      setFormData({ username: '', email: '', first_name: '', last_name: '', password: '' });
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création.');
    }
  };

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await api.admin.toggleUserActive(id);
      setConseillers(conseillers.map((c) => 
        c.id === id ? { ...c, is_active: !c.is_active } : c
      ));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification.');
    }
  };

  const deleteAccount = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce conseiller ?')) return;
    try {
      await api.admin.deleteUser(id);
      setConseillers(conseillers.filter((c) => c.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Conseillers</h1>
        <button className="btn btn-green" onClick={() => setShowModal(true)}>
          Ajouter un conseiller
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}

      {loading ? (
        <div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div>
      ) : conseillers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-text">Aucun conseiller</div>
          <div className="empty-state-sub">Ajoutez votre premier conseiller.</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Agriculteurs suivis</th>
                <th>État du compte</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {conseillers.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>
                    {c.first_name} {c.last_name}
                  </td>
                  <td>{c.email}</td>
                  <td>{c.agriculteurs_suivis || 0}</td>
                  <td>
                    <span className={`badge ${c.is_active ? 'badge-green' : 'badge-gray'}`}>
                      {c.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn-delete"
                      onClick={() => toggleActive(c.id, c.is_active)}
                      style={{ marginRight: '8px' }}
                    >
                      {c.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => deleteAccount(c.id)}
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)} />
            <h2 className="modal-title">Ajouter un conseiller</h2>
            {error && <div className="error-state">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Prénom</label>
                  <input
                    className="form-input"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom</label>
                  <input
                    className="form-input"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nom d&apos;utilisateur</label>
                <input
                  className="form-input"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mot de passe</label>
                <input
                  className="form-input"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-green">
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
