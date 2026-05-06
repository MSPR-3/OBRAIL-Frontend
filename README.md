# MSPR1-ObRail — Tableau de bord React

## Présentation

MSPR1-ObRail est un tableau de bord frontend développé en React permettant de visualiser des données ferroviaires européennes : trajets, opérateurs, lignes, émissions de CO₂, historique des imports, etc.

L’application consomme une API REST mais propose aussi des données fictives pour le développement local.

---

## Fonctionnalités principales

- **Vue Dashboard :** indicateurs clés (KPI), volume de trajets par opérateur, CO₂ par opérateur, derniers imports
- **Statistiques :** CO₂ total, comparatifs jour/nuit, top liaisons, lignes, opérateurs, pays
- **Historique des imports :** liste et filtrage des imports, métriques (réussite, échec, partiel)
- **Personnalisation :** thème jour/nuit, densité, couleur d’accent, affichage de la sidebar
- **Vérification automatique de la santé de l’API**

---

## Stack technique

- **React 18** + **Vite**
- **Recharts** (visualisation)
- **Playwright** (tests e2e)
- **Nginx** (serveur de production via Docker)

### Scripts NPM

- `npm run dev` — lance l’application en mode développement
- `npm run build` — build de production (dans `dist/`)
- `npm run preview` — prévisualisation du build
- `npm run test:e2e` — lance les tests end-to-end Playwright

---

## Installation & développement

1. **Cloner le repo puis installer les dépendances :**

   ```sh
   npm install
   ```

2. **Lancer en mode développement :**

   ```sh
   npm run dev
   ```

   > L’API `/api` est proxifiée vers `http://localhost:8000` (voir `vite.config.js`).

3. **Build de production :**

   ```sh
   npm run build
   ```

---

## Docker & déploiement

Une image Docker est prévue pour servir le frontend en production avec *nginx* :

```Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```
# Commandes typiques
docker build -t obrail-dashboard .
docker run -p 8080:80 obrail-dashboard
```

Le serveur nginx redirige `/api/` vers un backend API (voir `nginx.conf`).

---

## Tests end-to-end

Des scénarios Playwright E2E sont définis dans le dossier `e2e/`. Ils vérifient le rendu des pages, la présence des indicateurs, l’historique d’import, les métriques, etc.

```sh
npm run test:e2e
```

---

## Structure principale du projet

```
/               # Racine
├── src/        # Code source React
│   ├── api.js            # Gestion des requêtes API
│   ├── mockData.js       # Données fictives pour tests/démo
│   ├── App.jsx, main.jsx # Entrée app
│   └── pages/            # Pages principales (Dashboard, Imports…)
├── e2e/       # Tests end-to-end
├── styles/    # Styles globaux
├── nginx.conf # Config nginx de production
├── Dockerfile # Build d’image frontend
├── vite.config.js # Config Vite et proxy API
└── package.json   # Dépendances/scripts
```

---

## Configuration/Personnalisation

- **Le fichier `nginx.conf`** permet d’adapter le proxy vers l’API backend.
- **Tweaks UI** : thème, densité, couleurs sont modifiables depuis l’UI, stockés côté navigateur.
- **Donnees fictives** : modifiez `src/mockData.js` pour adapter le jeu de test.

---

## Pour aller plus loin

- Adapter le backend pour répondre au contrat d’API attendu (`/api/...`).
- Ajouter/réaliser des composants ou pages additionnels selon vos besoins spécifiques.

---

## Licence

Projet pédagogique. Utilisation libre.
