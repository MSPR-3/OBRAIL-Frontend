import { useState, useEffect } from 'react';

import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor } from './TweaksPanel';
import { api } from './api'; // Ajoute cet import !
import { Sidebar, Header } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Documentation from './pages/Documentation';
import Imports from './pages/Imports';
import Statistiques from './pages/Statistiques';
import Trajets from './pages/Trajets';

const PAGE_META = {
  '/': { title: 'Tableau de bord', breadcrumb: ['Tableau de bord'] },
  '/trajets': { title: 'Trajets', breadcrumb: ['Trajets'] },
  '/statistiques': { title: 'Statistiques', breadcrumb: ['Statistiques'] },
  '/imports': { title: 'Historique des imports', breadcrumb: ['Imports'] },
  '/documentation': { title: 'Documentation API', breadcrumb: ['API', 'Documentation'] },
};

function getRoute() {
  const h = window.location.hash.replace(/^#/, '') || '/';
  return PAGE_META[h] ? h : '/';
}

const TWEAK_DEFAULTS = {
  theme: 'day',
  density: 'comfortable',
  sidebar: 'expanded',
  accent: '#F5C518',
};

export default function App() {
  const [route, setRoute] = useState(getRoute());
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Correction : vérification réelle de l'API ici
  const [apiOk, setApiOk] = useState(true);

  useEffect(() => {
    async function checkApi() {
      try {
        await api.health(); // Va dans src/api.js
        setApiOk(true);
      } catch {
        setApiOk(false);
      }
    }
    checkApi();
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onHash() {
      setRoute(getRoute());
      window.scrollTo(0, 0);
    }
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = tweaks.theme;
    document.documentElement.style.setProperty('--accent', tweaks.accent);
    const map = { compact: 0.75, comfortable: 1, airy: 1.25 };
    document.documentElement.style.setProperty('--density', map[tweaks.density] || 1);
  }, [tweaks]);

  function navigate(id) {
    window.location.hash = id;
    setRoute(id);
  }

  const meta = PAGE_META[route];

  const pages = {
    '/': Dashboard,
    '/trajets': Trajets,
    '/statistiques': Statistiques,
    '/imports': Imports,
    '/documentation': Documentation,
  };
  const Page = pages[route] || Dashboard;

  return (
    <div
      className="app-shell"
      data-sidebar={tweaks.sidebar === 'collapsed' ? 'collapsed' : 'expanded'}
    >
      <Sidebar route={route} onNavigate={navigate} apiOk={apiOk} />
      <main>
        <Header title={meta.title} breadcrumb={meta.breadcrumb} />
        <div key={route} style={{ animation: 'fadeIn 0.32s ease' }}>
          <Page />
        </div>
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Apparence">
          <TweakRadio
            label="Thème"
            value={tweaks.theme}
            onChange={(v) => setTweak('theme', v)}
            options={[
              { value: 'night', label: 'Nuit' },
              { value: 'day', label: 'Jour' },
            ]}
          />
          <TweakColor
            label="Accent"
            value={tweaks.accent}
            onChange={(v) => setTweak('accent', v)}
          />
        </TweakSection>
        <TweakSection label="Mise en page">
          <TweakRadio
            label="Sidebar"
            value={tweaks.sidebar}
            onChange={(v) => setTweak('sidebar', v)}
            options={[
              { value: 'expanded', label: 'Étendue' },
              { value: 'collapsed', label: 'Icônes' },
            ]}
          />
          <TweakRadio
            label="Densité"
            value={tweaks.density}
            onChange={(v) => setTweak('density', v)}
            options={[
              { value: 'compact', label: 'Compact' },
              { value: 'comfortable', label: 'Confort' },
              { value: 'airy', label: 'Aéré' },
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}
