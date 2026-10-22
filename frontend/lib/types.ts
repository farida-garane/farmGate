// Types TypeScript strictement calqués sur les modèles et sérialiseurs Django de FarmGate.
// Aucune donnée fictive ou inventée.

export type Role = 'AGRICULTEUR' | 'CONSEILLER';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  is_staff: boolean;
  telephone: string | null;
  localisation: string | null;
}

export interface Parcelle {
  id: number;
  nom: string;
  superficie: string | number;
  localisation: string;
  type_sol: string;
  date_creation: string;
  agriculteur?: number;
}

export type StatutCampagne = 'EN_COURS' | 'TERMINEE';

export interface Campagne {
  id: number;
  parcelle: number;
  parcelle_nom?: string;
  agriculteur?: number;
  culture: string;
  date_debut: string;
  date_fin: string | null;
  statut: StatutCampagne;
  total_depenses?: number;
  interventions?: Intervention[];
  depenses?: Depense[];
  recoltes?: Recolte[];
}

export type TypeIntervention = 'SEMIS' | 'ENGRAIS' | 'TRAITEMENT' | 'AUTRE';

export interface Intervention {
  id: number;
  campagne: number;
  type: TypeIntervention;
  date: string;
  description: string;
}

export type CategorieDepense =
  | 'SEMENCES'
  | 'MAIN_OEUVRE'
  | 'ENGRAIS'
  | 'TRAITEMENT'
  | 'AUTRE';

export interface Depense {
  id: number;
  campagne: number;
  categorie: CategorieDepense;
  montant: number | string;
  date: string;
  description: string;
}

export type UniteRecolte = 'KG' | 'TONNE' | 'SAC';

export interface Recolte {
  id: number;
  campagne: number;
  date: string;
  quantite: number | string;
  unite: UniteRecolte;
}

export type TypeRecommandation = 'ACCOMPAGNEMENT' | 'ANALYSE' | 'PREVENTION';

export interface Recommandation {
  id: number;
  agriculteur: number;
  agriculteur_nom?: string;
  conseiller_nom?: string;
  campagne: number | null;
  type: TypeRecommandation;
  titre: string;
  message: string;
  lue: boolean;
  date_creation: string;
}

export interface AgriculteurSuivi extends User {
  nb_parcelles: number;
}
