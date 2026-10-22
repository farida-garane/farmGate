import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between p-6 sm:p-12">
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Farm<span className="text-emerald-600">Gate</span>
          </span>
        </div>

        <Link
          href="/login"
          className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 px-4 py-2 rounded-xl hover:bg-emerald-50 transition"
        >
          Connexion
        </Link>
      </header>

      <main className="max-w-2xl w-full mx-auto my-auto text-center py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Plateforme agricole unifiée
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          La gestion de vos parcelles et cultures en toute{' '}
          <span className="text-emerald-600">simplicité</span>.
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-500 max-w-lg mx-auto">
          Suivez vos campagnes, enregistrez vos dépenses et récoltes, et recevez les
          conseils techniques de vos conseillers agricoles.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-sm shadow-emerald-200 transition text-center"
          >
            Accéder à mon espace
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium transition text-center"
          >
            Créer un compte agriculteur
          </Link>
        </div>
      </main>

      <footer className="max-w-4xl w-full mx-auto text-center py-4 text-xs text-slate-400">
        © 2026 FarmGate • Système de gestion agronomique
      </footer>
    </div>
  );
}
