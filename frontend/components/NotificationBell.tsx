'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { NotificationItem } from '@/lib/types';

const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nonLues, setNonLues] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const refreshCount = () => {
    api.notifications
      .compteur()
      .then((r) => setNonLues(r.non_lues))
      .catch(() => {});
  };

  // Compteur au montage + toutes les 60 s
  useEffect(() => {
    refreshCount();
    const timer = setInterval(refreshCount, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fermeture au clic en dehors
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      try {
        const data = await api.notifications.list();
        setItems(data.slice(0, 10));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
      refreshCount();
    }
  };

  const handleClick = async (n: NotificationItem) => {
    setOpen(false);
    if (!n.lue) {
      try {
        await api.notifications.lire(n.id);
      } catch { /* ignore */ }
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, lue: true } : x)));
      setNonLues((c) => Math.max(0, c - 1));
    }
    if (n.lien) {
      router.push(n.lien);
    }
  };

  const toutLire = async () => {
    try {
      await api.notifications.lireTout();
    } catch { /* ignore */ }
    setItems((prev) => prev.map((x) => ({ ...x, lue: true })));
    setNonLues(0);
  };

  return (
    <div className="notif-bell" ref={ref}>
      <button
        type="button"
        className="notif-bell-btn"
        onClick={toggle}
        aria-label="Notifications"
      >
        <IconBell />
        {nonLues > 0 && (
          <span className="notif-badge">{nonLues > 9 ? '9+' : nonLues}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span className="notif-dropdown-title">Notifications</span>
            {nonLues > 0 && (
              <button type="button" className="notif-read-all" onClick={toutLire}>
                Tout marquer comme lu
              </button>
            )}
          </div>
          <div className="notif-list">
            {loading ? (
              <div className="notif-empty">Chargement...</div>
            ) : items.length === 0 ? (
              <div className="notif-empty">Aucune notification</div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`notif-item${n.lue ? '' : ' notif-item-unread'}`}
                  onClick={() => handleClick(n)}
                >
                  <span className="notif-item-title">{n.titre}</span>
                  {n.message && <span className="notif-item-message">{n.message}</span>}
                  <span className="notif-item-date">{formatDate(n.date_creation)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
