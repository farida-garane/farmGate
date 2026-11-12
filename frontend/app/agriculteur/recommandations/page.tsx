'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Recommandation, User } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const TYPE_LABELS: Record<string, string> = {
  ACCOMPAGNEMENT: 'Accompagnement',
  ANALYSE: 'Analyse',
  PREVENTION: 'Prévention',
  REPONSE: 'Réponse',
};

export default function RecommandationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [recommandations, setRecommandations] = useState<Recommandation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyFor, setReplyFor] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [data, me] = await Promise.all([
        api.agriculteur.getRecommandations(),
        api.auth.me(),
      ]);
      setRecommandations(data.sort((a, b) => b.date_creation.localeCompare(a.date_creation)));
      setUser(me);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les recommandations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const isMine = (r: Recommandation) =>
    !!user && (r.auteur_id ?? r.conseiller) === user.id;

  async function handleLire(id: number) {
    try {
      await api.agriculteur.lireRecommandation(id);
      setRecommandations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, lue: true } : r))
      );
    } catch {
      // silently fail
    }
  }

  async function handleRepondre(id: number) {
    const message = replyText.trim();
    if (!message) return;
    setSending(true);
    try {
      const created = await api.agriculteur.repondreRecommandation(id, message);
      setRecommandations((prev) => [created, ...prev]);
      setReplyFor(null);
      setReplyText('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible d\'envoyer la réponse.');
    } finally {
      setSending(false);
    }
  }

  const nonLues = recommandations.filter((r) => !r.lue && !isMine(r)).length;

  return (
    <div className="page-container">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Messages avec votre conseiller</h1>
        <p className="page-subtitle">
          {nonLues > 0 ? `${nonLues} non lue(s)` : 'Tout est lu'}
        </p>
      </div>

      {error && <div className="error-state">{error}</div>}

      {loading ? (
        <div className="loading-spinner"><div className="spinner-ring" /> Chargement...</div>
      ) : recommandations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-text">Aucun message</div>
          <div className="empty-state-sub">Votre conseiller n&apos;a pas encore envoyé de message.</div>
        </div>
      ) : (
        <div className="cards-grid" style={{ gridTemplateColumns: '1fr' }}>
          {recommandations.map((r) => {
            const mine = isMine(r);
            return (
              <div key={r.id} className={`card reco-card${!mine && !r.lue ? '' : ' reco-lue'}`}>
                <div className="reco-header">
                  <div>
                    <div className="card-title">
                      {r.titre || (r.type === 'REPONSE' ? 'Réponse' : 'Message')}
                    </div>
                    <div className="card-meta" style={{ marginTop: 4 }}>
                      {r.type !== 'REPONSE' && `${TYPE_LABELS[r.type] || r.type} · `}
                      {mine ? 'Vous' : (r.auteur_nom || r.conseiller_nom || 'Conseiller')}
                      {'  '}
                      {formatDate(r.date_creation)}
                    </div>
                  </div>
                  <span className={`badge ${mine ? 'badge-green' : !r.lue ? 'badge-gold' : 'badge-gray'}`}>
                    {mine ? 'Envoyé' : r.lue ? 'Lue' : 'Nouvelle'}
                  </span>
                </div>
                <p className="reco-message">{r.message}</p>
                {!mine && !r.lue && (
                  <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => handleLire(r.id)}>
                    Marquer comme lue
                  </button>
                )}
                {!mine && (
                  <div style={{ marginTop: 12 }}>
                    {replyFor === r.id ? (
                      <div>
                        <textarea
                          className="form-textarea"
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Votre réponse..."
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button
                            className="btn btn-green"
                            disabled={sending || !replyText.trim()}
                            onClick={() => handleRepondre(r.id)}
                          >
                            {sending ? 'Envoi...' : 'Envoyer'}
                          </button>
                          <button
                            className="btn btn-ghost"
                            onClick={() => { setReplyFor(null); setReplyText(''); }}
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn btn-outline" onClick={() => { setReplyFor(r.id); setReplyText(''); }}>
                        Répondre
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
