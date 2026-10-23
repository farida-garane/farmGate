// Client API léger pour communiquer avec le backend Django de FarmGate.
// Il utilise strictement les routes réelles de Django et gère les sessions et le CSRF.

import { getCookie } from './utils';
import type {
  Campagne,
  Depense,
  Intervention,
  Parcelle,
  Recolte,
  Recommandation,
  User,
  AgriculteurSuivi,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Ajout du jeton CSRF de Django pour les requêtes de modification (POST, PUT, PATCH, DELETE)
  if (typeof window !== 'undefined' && options.method && options.method !== 'GET') {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Envoie et reçoit le cookie de session Django
  });

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    const message =
      typeof errorData === 'object' && errorData !== null && 'detail' in errorData
        ? String((errorData as { detail: string }).detail)
        : `Erreur API (${response.status})`;

    throw new ApiError(response.status, message, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Authentification
  auth: {
    login: (credentials: { username: string; password: string }) =>
      request<User>('/auth/login/', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: {
      username: string;
      email: string;
      first_name: string;
      last_name: string;
      telephone?: string;
      localisation?: string;
      role: 'AGRICULTEUR' | 'CONSEILLER';
      password: string;
      password2: string;
    }) =>
      request<User>('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
  },

  // Espace Agriculteur
  agriculteur: {
    getParcelles: () => request<Parcelle[]>('/agriculteur/parcelles/'),
    createParcelle: (data: Omit<Parcelle, 'id' | 'date_creation'>) =>
      request<Parcelle>('/agriculteur/parcelles/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteParcelle: (id: number) =>
      request<void>(`/agriculteur/parcelles/${id}/`, {
        method: 'DELETE',
      }),

    getCampagnes: (parcelleId?: number) => {
      const query = parcelleId ? `?parcelle=${parcelleId}` : '';
      return request<Campagne[]>(`/agriculteur/campagnes/${query}`);
    },
    createCampagne: (data: {
      parcelle: number;
      culture: string;
      date_debut: string;
      date_fin?: string | null;
      statut: 'EN_COURS' | 'TERMINEE';
    }) =>
      request<Campagne>('/agriculteur/campagnes/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteCampagne: (id: number) =>
      request<void>(`/agriculteur/campagnes/${id}/`, {
        method: 'DELETE',
      }),

    getInterventions: (campagneId?: number) => {
      const query = campagneId ? `?campagne=${campagneId}` : '';
      return request<Intervention[]>(`/agriculteur/interventions/${query}`);
    },
    createIntervention: (data: Omit<Intervention, 'id'>) =>
      request<Intervention>('/agriculteur/interventions/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteIntervention: (id: number) =>
      request<void>(`/agriculteur/interventions/${id}/`, {
        method: 'DELETE',
      }),

    getDepenses: (campagneId?: number) => {
      const query = campagneId ? `?campagne=${campagneId}` : '';
      return request<Depense[]>(`/agriculteur/depenses/${query}`);
    },
    createDepense: (data: Omit<Depense, 'id'>) =>
      request<Depense>('/agriculteur/depenses/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteDepense: (id: number) =>
      request<void>(`/agriculteur/depenses/${id}/`, {
        method: 'DELETE',
      }),

    getRecoltes: (campagneId?: number) => {
      const query = campagneId ? `?campagne=${campagneId}` : '';
      return request<Recolte[]>(`/agriculteur/recoltes/${query}`);
    },
    createRecolte: (data: Omit<Recolte, 'id'>) =>
      request<Recolte>('/agriculteur/recoltes/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteRecolte: (id: number) =>
      request<void>(`/agriculteur/recoltes/${id}/`, {
        method: 'DELETE',
      }),

    getRecommandations: () =>
      request<Recommandation[]>('/conseiller/mes-recommandations/'),
    lireRecommandation: (id: number) =>
      request<Recommandation>(`/conseiller/mes-recommandations/${id}/lire/`, {
        method: 'POST',
      }),
  },

  // Espace Conseiller
  conseiller: {
    getAgriculteurs: (params?: { localisation?: string; search?: string }) => {
      const sp = new URLSearchParams();
      if (params?.localisation) sp.set('localisation', params.localisation);
      if (params?.search) sp.set('search', params.search);
      const qs = sp.toString() ? `?${sp.toString()}` : '';
      return request<AgriculteurSuivi[]>(`/conseiller/agriculteurs/${qs}`);
    },
    getParcelles: (agriculteurId?: number) => {
      const query = agriculteurId ? `?agriculteur=${agriculteurId}` : '';
      return request<Parcelle[]>(`/conseiller/parcelles/${query}`);
    },
    getCampagnes: (params?: {
      agriculteur?: number;
      parcelle?: number;
      statut?: string;
      culture?: string;
    }) => {
      const sp = new URLSearchParams();
      if (params?.agriculteur) sp.set('agriculteur', String(params.agriculteur));
      if (params?.parcelle) sp.set('parcelle', String(params.parcelle));
      if (params?.statut) sp.set('statut', params.statut);
      if (params?.culture) sp.set('culture', params.culture);
      const qs = sp.toString() ? `?${sp.toString()}` : '';
      return request<Campagne[]>(`/conseiller/campagnes/${qs}`);
    },
    getRecommandations: (agriculteurId?: number) => {
      const query = agriculteurId ? `?agriculteur=${agriculteurId}` : '';
      return request<Recommandation[]>(`/conseiller/recommandations/${query}`);
    },
    createRecommandation: (data: {
      agriculteur: number;
      campagne?: number | null;
      type: 'ACCOMPAGNEMENT' | 'ANALYSE' | 'PREVENTION';
      titre: string;
      message: string;
    }) =>
      request<Recommandation>('/conseiller/recommandations/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};
