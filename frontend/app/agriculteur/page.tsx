'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Parcelle, Campagne, Recommandation } from '@/lib/types';

export default function DashboardPage() {
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [campagnes, setCampagnes] = useState<Campagne[]>([]);
  const [recommandations, setRecommandations] = useState<Recommandation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.agriculteur.getParcelles(),
      api.agriculteur.getCampagnes(),
      api.agriculteur.getRecommandations(),
    ])
      .then(([p, c, r]) => {
        setParcelles(p);
        setCampagnes(c);
        setRecommandations(r);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const campagnesEnCours = campagnes.filter((c) => c.statut === 'EN_COURS').length;
  const nonLues = recommandations.filter((r) => !r.lue).length;

  return (
    <div className="dashboard-page">

      {/* ── Bloc de bienvenue ───────────────────────── */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-text">
          <h1 className="dashboard-hello">Bienvenue</h1>
          <p className="dashboard-subtitle">
            dans votre espace agriculteur
          </p>
          <p className="dashboard-desc">
            Suivez vos parcelles, vos cultures et vos récoltes depuis un seul endroit.
          </p>
        </div>
         <div className="ag-home-actions">
          <Link href="/agriculteur/parcelles" className="ag-btn ag-btn-primary">
            Explorer mon espace→
          </Link>
        </div>
      </div>
     

    </div>
  );
}
