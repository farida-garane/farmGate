# FarmGate

**FarmGate** est une plateforme de gestion agricole qui met en relation des **agriculteurs** et des **conseillers agricoles**.

L'agriculteur enregistre et suit son exploitation (parcelles, campagnes, interventions, dépenses, récoltes). Le conseiller l'accompagne : il consulte ses données et lui envoie des recommandations. L'administrateur gère la plateforme en arrière-plan.

---

## Les trois rôles

| Rôle | Ce qu'il fait | Ce qu'il ne fait pas |
|---|---|---|
| **Agriculteur** | Utilise l'application au quotidien : crée ses parcelles, ses campagnes, ses interventions, ses dépenses et ses récoltes, et lit les conseils reçus. | Ne voit pas les données des autres agriculteurs. |
| **Conseiller agricole** | Suit ses agriculteurs, consulte leurs données et leur envoie des recommandations. | Ne crée ni ne modifie les données agricoles de l'agriculteur. |
| **Administrateur** | Administre la plateforme : création des comptes, changement d'état des comptes, suivi des inscriptions, vision globale de l'activité. | N'intervient pas dans le suivi agricole. |

L'administrateur n'est pas un utilisateur « comme les autres » : son compte ne peut pas être créé depuis le formulaire d'inscription (voir [Créer le premier compte administrateur](#créer-le-premier-compte-administrateur)).

---

## Fonctionnalités

### Gestion des parcelles et des campagnes
Chaque agriculteur possède des **parcelles**. Chaque parcelle contient des **campagnes** (une culture, des dates, un statut). Chaque campagne regroupe :

- les **interventions** (semis, traitement, fertilisation, etc.) ;
- les **dépenses**, avec le total de la campagne ;
- les **récoltes**, avec la quantité totale.

### Messagerie conseiller ↔ agriculteur
Un fil de discussion bidirectionnel relie le conseiller et l'agriculteur.

- Le conseiller envoie des **recommandations typées** : *Accompagnement*, *Analyse* ou *Prévention*.
- L'agriculteur **répond librement** dans le même fil.
- Le conseiller voit si ses recommandations ont été lues.

### Notifications internes
Une **cloche** est affichée dans les interfaces, avec une pastille quand il y a du nouveau.

Événements qui déclenchent une notification :

- réception d'un message ;
- inscription d'un nouvel utilisateur ;
- activation ou désactivation d'un compte.

L'administrateur reçoit une **copie de toutes les notifications**.

### Gestion des comptes (administrateur)
- Création de comptes (agriculteur ou conseiller).
- Changement d'état d'un compte : **Actif**, **Désactivé** ou **Supprimé**.
- Suivi des inscriptions.

### Profils complets
Les informations saisies à l'inscription sont affichées dans la page profil et dans les tableaux de l'application.

---

## Technologies utilisées

| Partie | Technologie |
|---|---|
| Frontend | Next.js (React + TypeScript) |
| Backend | Django et Django REST Framework |
| Base de données | PostgreSQL 16 |
| Conteneurs | Docker et Docker Compose |

---

## Architecture

Le projet se compose de **trois services**, lancés ensemble par Docker Compose :

```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│   frontend    │ ───> │    backend    │ ───> │      db       │
│   Next.js     │ HTTP │ Django REST   │ SQL  │  PostgreSQL   │
│  port 3000    │      │   port 8000   │      │  port 5434*   │
└───────────────┘      └───────────────┘      └───────────────┘
```

\* Le port 5434 est celui exposé sur la machine pour se connecter à la base avec un outil externe. Entre conteneurs, la base est joignable sur le port 5432, avec le nom d'hôte `db`.

---

## Démarrage

### Prérequis

- **Docker** et **Docker Compose**
- **Git**

### 1. Récupérer le projet

```bash
git clone https://github.com/farida-garane/farmGate.git
cd farmGate
```

### 2. Lancer la plateforme

```bash
docker compose up -d --build
```

Cette commande construit les images, puis démarre les trois services. Au démarrage, le backend applique automatiquement les migrations de la base de données.

### 3. Ouvrir l'application

- Application : **http://localhost:3000**
- API : **http://localhost:8000**

### Créer le premier compte administrateur

Le formulaire d'inscription ne crée que des agriculteurs et des conseillers. Pour créer un administrateur :

```bash
docker compose exec backend python manage.py createsuperuser
```

Ce compte est ensuite reconnu comme administrateur (`is_staff`) et accède à l'espace `/admin`.

### Arrêter le projet

```bash
docker compose down
```

Cette commande arrête les conteneurs **sans supprimer** les données. L'option `-v` supprime aussi la base de données : à utiliser avec précaution.

---

## Structure du projet

```
├── docker-compose.yml     # Orchestration des 3 services
├── Backend/               # API Django REST Framework
│   ├── utilisateurs/      # Comptes utilisateurs et authentification
│   ├── agriculteur/       # Parcelles, campagnes, interventions, dépenses, récoltes
│   ├── technicien/        # Conseillers : suivi des agriculteurs et messagerie
│   └── notifications/     # Système de notifications internes
└── frontend/              # Interface Next.js (React + TypeScript)
    └── app/               # Pages des 3 espaces : agriculteur, conseiller, admin
```

---

## Les interfaces

| Espace | Adresse | Public |
|---|---|---|
| Agriculteur | `/agriculteur` | Agriculteurs connectés |
| Conseiller | `/conseiller` | Conseillers connectés |
| Administrateur | `/admin` | Administrateurs (`is_staff`) |

L'accès se fait depuis la page de connexion (`/login`) ou d'inscription (`/register`). Après la connexion, l'utilisateur est dirigé vers l'espace qui correspond à son rôle.

---

## Authentification et sécurité

- La connexion utilise la **session Django** : après la connexion, le navigateur conserve un cookie de session.
- Chaque espace est **réservé à son rôle** : le frontend redirige vers `/login` si l'utilisateur n'est pas connecté ou n'a pas le bon rôle.
- Les routes d'administration de l'API sont **réservées aux administrateurs** (`is_staff`).
- Les mots de passe sont **chiffrés** par Django : ils ne peuvent pas être relus, seulement remplacés.
