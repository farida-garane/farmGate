'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Recommandation } from '@/lib/types';

export default function ConseillerDashboardPage() {
  const [recommandations, setRecommandations] = useState<Recommandation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.conseiller.getRecommandations()
      .then((r) => setRecommandations(r))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const nonLues = recommandations.filter((r) => !r.lue).length;

  return (
    <div className="dashboard-page">

      {/* ── Bloc de bienvenue ───────────────────────── */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-text">
          <h1 className="dashboard-hello">Bienvenue</h1>
          <p className="dashboard-subtitle">
            dans votre espace conseiller
          </p>
          <p className="dashboard-desc">
            Accédez à vos agriculteurs, suivez leurs activités et envoyez des recommandations pour optimiser leurs cultures.
          </p>
        </div>
        <div className="ag-home-actions">
          <Link href="/conseiller/agriculteurs" className="ag-btn ag-btn-primary">
            Explorer mon espace→
          </Link>
        </div>
      </div>

    </div>
  );
}
