'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

type UserAdmin = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  telephone?: string;
  localisation?: string;
  date_creation: string;
  is_active: boolean;
  statut: 'ACTIF' | 'INACTIF';
};

export default function AdminAgriculteursPage() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIF' | 'INACTIF'>('all');
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    last_name: '',
    first_name: '',
    telephone: '',
    email: '',
    localisation: '',
    password: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getAllUsers();
      setUsers(data.filter((u: any) => u.role === 'AGRICULTEUR'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les agriculteurs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Ouvre le modal de création via le lien « Ajouter » du dashboard (?ajouter=1)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('ajouter') === '1') {
      setShowModal(true);
    }
  }, []);

  // Masquer le message de succès après 3 secondes
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (u.last_name && u.last_name.toLowerCase().includes(q)) ||
      (u.first_name && u.first_name.toLowerCase().includes(q)) ||
      (u.telephone && u.telephone.includes(search));

    const matchesStatus =
      statusFilter === 'all' || u.statut === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatutChange = async (user: UserAdmin, newStatut: 'ACTIF' | 'INACTIF') => {
    // Pas de changement si même statut
    if (newStatut === user.statut) return;

    const nomComplet = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;

    // Confirmation pour désactivation
    if (newStatut === 'INACTIF') {
      const ok = window.confirm(
        `Voulez-vous désactiver le compte de « ${nomComplet} » ?\n\nCet utilisateur ne pourra plus se connecter tant que le compte est désactivé.`
      );
      if (!ok) return;
    }

    setError('');
    setSuccess('');
    try {
      const updated = await api.admin.changeStatut(user.id, newStatut);
      setUsers(users.map((u) => (u.id === user.id ? { ...u, ...updated } : u)));

      setSuccess(
        newStatut === 'ACTIF'
          ? `Le compte de « ${nomComplet} » a été activé.`
          : `Le compte de « ${nomComplet} » a été désactivé.`
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification du statut.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.admin.createUser({ ...formData, role: 'AGRICULTEUR' });
      setShowModal(false);
      setFormData({ last_name: '', first_name: '', telephone: '', email: '', localisation: '', password: '' });
      setSuccess(`L'agriculteur « ${formData.first_name} ${formData.last_name} » a été créé avec succès.`);
      loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de la création.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Agriculteurs</h1>
        <button className="btn btn-green" onClick={() => setShowModal(true)}>
          + Ajouter un agriculteur
        </button>
      </div>

      {error && (
        <div className="error-state" style={{ marginBottom: '16px', padding: '12px 16px', background: '#FEF2F2', color: '#991B1B', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#F0FDF4', color: '#166534', borderRadius: '8px', fontSize: '14px', border: '1px solid #BBF7D0' }}>
          {success}
        </div>
      )}

      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Rechercher par nom ou téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
        <select
          className="form-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          style={{ minWidth: '150px' }}
        >
          <option value="all">Tous</option>
          <option value="ACTIF">Actif</option>
          <option value="INACTIF">Désactivé</option>
         
        </select>
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
                <th>Nom d'utilisateur</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Localité</th>
                <th>Date d&apos;inscription</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.username}</td>
                  <td style={{ fontWeight: 600 }}>{u.last_name || '—'}</td>
                  <td>{u.first_name || '—'}</td>
                  <td>{u.telephone || '—'}</td>
                  <td>{u.email}</td>
                  <td>{u.localisation || '—'}</td>
                  <td>{formatDate(u.date_creation)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <select
                        className="form-input"
                        value={u.statut || 'ACTIF'}
                        onChange={(e) => handleStatutChange(u, e.target.value as 'ACTIF' | 'INACTIF')}
                        style={{ minWidth: '120px', padding: '6px 10px', fontSize: '13px' }}
                      >
                        <option value="ACTIF">Actif</option>
                        <option value="INACTIF">Désactivé</option>
                      </select>
                      <span className={`badge ${u.statut === 'ACTIF' ? 'badge-green' : 'badge-gray'}`}>
                        {u.statut === 'ACTIF' ? 'Compte actif' : 'Compte désactivé'}
                      </span>
                    </div>
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
            <h2 className="modal-title">Ajouter un agriculteur</h2>
            {formError && (
              <div className="error-state" style={{ marginBottom: '12px', padding: '10px 14px', background: '#FEF2F2', color: '#991B1B', borderRadius: '8px', fontSize: '14px' }}>
                ❌ {formError}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nom</label>
                  <input className="form-input" required value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Prénom</label>
                  <input className="form-input" required value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input className="form-input" type="tel" required value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Localité</label>
                <input className="form-input" required value={formData.localisation} onChange={(e) => setFormData({ ...formData, localisation: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Mot de passe</label>
                <div className="password-input-wrapper">
                  <input
                    className="form-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-green">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
