# FarmGate

Plateforme de gestion agricole qui met en relation **agriculteurs** et **conseillers agricoles**.

L'agriculteur gère ses parcelles, campagnes et activités ; le conseiller l'accompagne en consultant ses données et en lui envoyant des recommandations. L'**administrateur** n'est pas un utilisateur de la plateforme au même titre que les deux autres : il travaille **en arrière-plan** et contrôle l'ensemble — il gère les comptes, supervise les inscriptions et suit l'activité globale.

Concrètement :

- **Agriculteur** : utilise l'application au quotidien pour enregistrer et suivre son exploitation.
- **Conseiller agricole** : suit ses agriculteurs, analyse leurs données et leur adresse des conseils.
- **Administrateur** : n'intervient pas dans le suivi agricole ; il administre la plateforme (comptes utilisateurs, états des comptes, vision globale).

## Fonctionnalités

- **Gestion des parcelles et campagnes** : chaque parcelle contient des campagnes (culture, dates, statut) avec interventions, dépenses et récoltes.
- **Messagerie conseiller ↔ agriculteur** : fil de discussion bidirectionnel. Le conseiller envoie des recommandations typées (Accompagnement, Analyse, Prévention) ; l'agriculteur répond librement.
- **Notifications internes** : cloche dans les interfaces. Événements : message reçu, inscription, activation/désactivation de compte. L'administrateur reçoit une copie de toutes les notifications.
- **Gestion des comptes (admin)** : création de comptes, changement d'état (Actif / Désactivé / Supprimé), suivi des inscriptions.
- **Profils complets** : les informations saisies à l'inscription sont affichées dans les profils et les tableaux.

## Démarrage

Prérequis : **Docker** et **Docker Compose**.

```bash
# Lancer la plateforme (frontend + backend + base de données)
docker compose up -d --build
```

Puis ouvrir **http://localhost:3000** dans le navigateur.

### Créer le premier compte administrateur

Le formulaire d'inscription ne crée que des agriculteurs et conseillers. Pour créer un administrateur :

```bash
docker compose exec backend python manage.py createsuperuser
```

### Arrêter le projet

```bash
docker compose down
```

## Structure du projet

```
├── docker-compose.yml     # Orchestration des 3 services (frontend, backend, base de données)
├── Backend/               # API Django REST Framework
│   ├── utilisateurs/      # Comptes utilisateurs et authentification
│   ├── agriculteur/       # Parcelles, campagnes, interventions, dépenses, récoltes
│   ├── technicien/        # Conseillers : suivi des agriculteurs et messagerie
│   └── notifications/     # Système de notifications internes
└── frontend/              # Interface Next.js (React + TypeScript)
    └── app/               # Pages des 3 espaces : agriculteur, conseiller, admin
```

## Interfaces

| Espace | Adresse | Public |
|---|---|---|
| Agriculteur | `/agriculteur` | Agriculteurs connectés |
| Conseiller | `/conseiller` | Conseillers connectés |
| Administrateur | `/admin` | Administrateurs (`is_staff`) |

L'accès se fait depuis la page de connexion (`/login`) ou d'inscription (`/register`).
