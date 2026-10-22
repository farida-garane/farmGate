// Fonctions utilitaires légères d'affichage et de formatage

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formate un montant en FCFA (ex: 250000 -> "250 000 FCFA")
 */
export function formatFCFA(montant: number | string): string {
  const numeric = typeof montant === 'string' ? Number(montant) : montant;
  if (isNaN(numeric)) return '0 FCFA';
  return `${new Intl.NumberFormat('fr-FR').format(numeric)} FCFA`;
}

/**
 * Formate une date ISO ou YYYY-MM-DD au format français lisible (ex: "18 oct. 2026")
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Récupère un cookie par son nom (utile pour le jeton csrftoken de Django côté navigateur)
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}
