# OBRAIL-Frontend — Tableau de bord ferroviaire européen

![React](https://img.shields.io/badge/React-18.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![Nginx](https://img.shields.io/badge/Nginx-Alpine-green)
![Playwright](https://img.shields.io/badge/Tests-E2E-orange)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-orange)

## Contexte

Ce projet s'inscrit dans le cadre du **MSPR**, formation DIADS/DIA.
L'interface **OBRAIL Europe** est le tableau de bord frontend de l'observatoire des données ferroviaires européennes. Elle permet de visualiser les trajets, statistiques, émissions CO₂ et l'historique des importations de données.

---

## Fonctionnalités

### Dashboard

| Widget                   | Description                                                |
| ------------------------ | ---------------------------------------------------------- |
| **KPI globaux**          | CO₂ total, CO₂ moyen/trajet, durée moyenne, lignes actives |
| **Volume par opérateur** | Graphique barres comparant les trajets par compagnie       |
| **CO₂ par opérateur**    | Émissions moyennes par compagnie ferroviaire               |
| **Derniers imports**     | Badge de statut du dernier chargement réussi               |

### Statistiques

| Section              | Contenu                                               |
| -------------------- | ----------------------------------------------------- |
| **Jour vs Nuit**     | Pie chart comparatif avec compteurs                   |
| **Opérateurs**       | Barres trajets + CO₂ moyen par opérateur              |
| **Top 10 lignes**    | Classement horizontal des lignes les plus fréquentées |
| **Trajets par pays** | Répartition géographique des départs                  |
| **Comparatif J/N**   | Tableau détaillé (trajets, durée, CO₂)                |

### Trajets

- Tableau paginé des trajets avec colonnes : ID, Départ, Arrivée, Durée, CO₂, Opérateur, Ligne
- **Filtres** : opérateur, ligne, pays de départ, pays d'arrivée
- **Drawer de détails** : fiche complète d'un trajet au clic sur "Détails"

### Imports

- Banner du dernier import réussi avec indicateur visuel
- Historique complet dans un tableau paginé
- Métriques de réussite/échec/partiel

### Personnalisation

- **Thème jour/nuit** basculable
- **Densité** d'affichage ajustable
- **Couleur d'accent** personnalisable
- **Vérification automatique** de la santé de l'API

---

## Stack Technique

| Couche            | Technologie                      |
| ----------------- | -------------------------------- |
| **Framework**     | React 18 (fonctionnel, hooks)    |
| **Build**         | Vite 5.4                         |
| **Visualisation** | Recharts                         |
| **Routing**       | Hash Router (React Router)       |
| **Tests E2E**     | Playwright                       |
| **Linting**       | ESLint 9 (flat config)           |
| **Formatage**     | Prettier                         |
| **Hooks Git**     | Husky + lint-staged + commitlint |
| **Production**    | Nginx Alpine (Docker)            |

---

## Structure du projet

```
OBRAIL-Frontend/
├── src/
│   ├── main.jsx                # Point d'entrée React
│   ├── App.jsx                 # Router + layout principal
│   ├── api.js                  # Couche d'appels API
│   ├── mockData.js             # Données fictives (développement)
│   ├── utils.js                # Fonctions utilitaires (formatage, couleurs)
│   ├── TweaksPanel.jsx         # Panneau de personnalisation UI
│   ├── hooks/
│   │   └── useApi.js           # Hook personnalisé pour les appels API
│   ├── components/
│   │   ├── Layout.jsx          # Sidebar, MetricCard, Badge, Drawer
│   │   └── Shared.jsx          # ChartTooltip, composants réutilisables
│   └── pages/
│       ├── Dashboard.jsx       # Page d'accueil avec KPIs
│       ├── Trajets.jsx         # Tableau des trajets avec filtres
│       ├── Statistiques.jsx    # Graphiques et comparatifs
│       ├── Imports.jsx         # Historique des imports
│       └── Documentation.jsx   # Documentation API intégrée
├── e2e/                        # Tests Playwright E2E
│   ├── mocks.js                # Mocks des réponses API
│   ├── dashboard.spec.js
│   ├── trajets.spec.js
│   ├── statistiques.spec.js
│   ├── imports.spec.js
│   └── health.spec.js
├── styles/
│   └── global.css              # Styles globaux + variables CSS
├── .github/workflows/          # Pipelines CI/CD
│   ├── ci.yml                  # Lint + Build
│   └── cd.yml                  # Déploiement Vercel
│   └── docker.yml              # Build & push image Docker
├── Dockerfile                  # Build multi-stage (Node → Nginx)
├── nginx.conf                  # Configuration Nginx production
├── vite.config.js              # Config Vite + proxy API
├── eslint.config.js            # ESLint flat config
├── .prettierrc                 # Configuration Prettier
├── commitlint.config.js        # Convention de commits
├── package.json
└── README.md                   # Ce fichier
```

---

## Installation & Développement

### Prérequis

- Node.js 20+
- npm
- OBRAIL-API démarrée sur `http://localhost:8000` (pour le mode connecté)

### Installation

```powershell
cd OBRAIL-Frontend
npm install
```

### Mode développement

```powershell
npm run dev
```

L'application est accessible sur **http://localhost:5173**.

> Le proxy Vite redirige automatiquement les requêtes `/api` vers `http://localhost:8000`.

### Build de production

```powershell
npm run build
```

Le résultat est généré dans le dossier `dist/`.

### Prévisualisation du build

```powershell
npm run preview
```

---

## Scripts NPM

| Commande           | Description                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Serveur de développement avec hot-reload |
| `npm run build`    | Build optimisé pour la production        |
| `npm run preview`  | Prévisualisation du build local          |
| `npm run test:e2e` | Tests end-to-end Playwright              |
| `npm run lint`     | Lint + auto-fix avec ESLint              |
| `npm run format`   | Formatage avec Prettier                  |
| `npm run prepare`  | Installation automatique des hooks Husky |

---

## Qualité de code

### ESLint

Configuration moderne (flat config) avec plugins React, React Hooks et Import order :

```js
// eslint.config.js
- Rules React recommended
- react-hooks/recommended
- import/order (alphabétique, newlines-between)
- no-unused-vars (warn)
```

### Prettier

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

### Husky + lint-staged + commitlint

À chaque commit :

1. **lint-staged** exécute ESLint + Prettier sur les fichiers modifiés
2. **commitlint** vérifie que le message suit les Conventional Commits

```
feat: add new dashboard widget
fix: correct CO₂ calculation
docs: update API endpoints
test: add e2e scenario for imports
```

---

## Tests End-to-End

Les tests Playwright vérifient le rendu et le comportement de chaque page :

| Test         | Vérification                               |
| ------------ | ------------------------------------------ |
| Dashboard    | KPIs, volumes opérateurs, derniers imports |
| Trajets      | Tableau, filtres, drawer de détails        |
| Statistiques | Graphiques J/N, top lignes, comparatif     |
| Imports      | Banner, historique, métriques              |
| Health       | Navigation, statut API                     |

### Exécuter les tests

```powershell
npm run test:e2e
```

Les tests utilisent des **mocks API** pour ne pas dépendre du backend.

---

## Docker & Production

### Image Docker

Build multi-stage pour une image de production minimale (~25 MB) :

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Nginx

- SPA routing (fallback sur `index.html`)
- Proxy `/api/` vers le backend
- Compression Gzip activée

### Build & Run

```powershell
docker build -t obrail-frontend:latest .
docker run -p 80:80 obrail-frontend:latest
```

### CI/CD — Build & Push automatisé

Le workflow `docker.yml` construit et pousse l'image sur GHCR :

| Événement      | Tag Docker                               |
| -------------- | ---------------------------------------- |
| Push `main`    | `ghcr.io/mspr-3/obrail-frontend:main`    |
| Push `develop` | `ghcr.io/mspr-3/obrail-frontend:develop` |
| Tag `v1.2.0`   | `ghcr.io/mspr-3/obrail-frontend:1.2.0`   |
| PR #42         | `ghcr.io/mspr-3/obrail-frontend:pr-42`   |

### Récupérer l'image

```powershell
docker pull ghcr.io/mspr-3/obrail-frontend:main
docker run -p 80:80 ghcr.io/mspr-3/obrail-frontend:main
```

---

## Architecture d'intégration

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  OBRAIL-Frontend │────▶│   OBRAIL-API     │────▶│   OBRAIL-BDD     │
│  (React/Vite)    │     │  (FastAPI)       │     │  (PostgreSQL)    │
│   Port 5173      │     │   Port 8000      │     │   Port 5434      │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

---

## Configuration

### Variables d'environnement

| Variable       | Description          | Exemple                 |
| -------------- | -------------------- | ----------------------- |
| `VITE_API_URL` | URL de l'API backend | `http://localhost:8000` |

### Proxy Vite

Développement : les requêtes `/api` sont redirigées vers l'API locale via `vite.config.js`.

Production : le proxy est géré par Nginx (`nginx.conf`).

---

## Licence

Projet pédagogique. Usage interne — DIADS/DIA.
