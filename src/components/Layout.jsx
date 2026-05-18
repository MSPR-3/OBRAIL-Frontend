import { useState, useEffect } from 'react';

import { api } from '../api';

export function Icon({ name, size = 18 }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };
  const paths = {
    home: (
      <>
        <path d="M3 11l9-7 9 7" />
        <path d="M5 10v9h14v-9" />
        <path d="M10 19v-5h4v5" />
      </>
    ),
    train: (
      <>
        <rect x="5" y="3" width="14" height="14" rx="3" />
        <path d="M5 11h14" />
        <circle cx="9" cy="14" r=".8" fill="currentColor" />
        <circle cx="15" cy="14" r=".8" fill="currentColor" />
        <path d="M7 17l-2 4M17 17l2 4" />
      </>
    ),
    chart: (
      <>
        <path d="M3 21h18" />
        <rect x="5" y="11" width="3" height="9" />
        <rect x="11" y="6" width="3" height="14" />
        <rect x="17" y="14" width="3" height="6" />
      </>
    ),
    pulse: (
      <>
        <path d="M3 12h4l2-7 4 14 2-7h6" />
      </>
    ),
    doc: (
      <>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5M9 13h6M9 17h6" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </>
    ),
    close: (
      <>
        <path d="M6 6l12 12M18 6L6 18" />
      </>
    ),
    chevron: (
      <>
        <path d="M9 6l6 6-6 6" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </>
    ),
    moon: (
      <>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </>
    ),
    arrowUp: (
      <>
        <path d="M7 17l10-10M7 7h10v10" />
      </>
    ),
    arrowDown: (
      <>
        <path d="M7 7l10 10M17 7v10H7" />
      </>
    ),
    leaf: (
      <>
        <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 12-4 16-9 16z" />
        <path d="M4 20l8-8" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    server: (
      <>
        <rect x="3" y="4" width="18" height="7" rx="1" />
        <rect x="3" y="13" width="18" height="7" rx="1" />
        <circle cx="7" cy="7.5" r=".8" fill="currentColor" />
        <circle cx="7" cy="16.5" r=".8" fill="currentColor" />
      </>
    ),
    refresh: (
      <>
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        <path d="M3 21v-5h5" />
      </>
    ),
    play: (
      <>
        <polygon points="6 4 20 12 6 20 6 4" />
      </>
    ),
    pause: (
      <>
        <rect x="6" y="4" width="4" height="16" />
        <rect x="14" y="4" width="4" height="16" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      </>
    ),
    external: (
      <>
        <path d="M14 4h6v6" />
        <path d="M10 14L20 4" />
        <path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6" />
      </>
    ),
    panel: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M9 4v16" />
      </>
    ),
    map: (
      <>
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </>
    ),
  };
  return <svg {...props}>{paths[name] || null}</svg>;
}

export const NAV = [
  { id: '/', label: 'Tableau de bord', icon: 'home', mobileLabel: 'Accueil' },
  { id: '/trajets', label: 'Trajets', icon: 'train', mobileLabel: 'Trajets' },
  { id: '/statistiques', label: 'Statistiques', icon: 'chart', mobileLabel: 'Stats' },
  { id: '/imports', label: 'Imports', icon: 'refresh', mobileLabel: 'Imports' },
  { id: '/documentation', label: 'Documentation API', icon: 'doc', mobileLabel: 'Docs' },
];

// COMPOSANT LAYOUT PRINCIPAL
export function Layout({ route, onNavigate, children }) {
  const [apiOk, setApiOk] = useState(true);

  useEffect(() => {
    const checkApi = async () => {
      try {
        await api.health();
        setApiOk(true);
      } catch {
        setApiOk(false);
      }
    };
    checkApi(); // Premier check au montage
    const interval = setInterval(checkApi, 30000); // Puis toutes les 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar route={route} onNavigate={onNavigate} apiOk={apiOk} />
      <main>{children}</main>
    </div>
  );
}

// SIDEBAR : reçoit apiOk en prop, N’APPELLE PAS L’API
export function Sidebar({ route, onNavigate, apiOk }) {
  const now = new Date();
  const time = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return (
    <nav className="sidebar" aria-label="Navigation principale">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" aria-hidden="true">
          <Icon name="train" size={18} />
        </div>
        <div className="sidebar-brand-text">
          ObRail
          <small>Europe / Observatoire</small>
        </div>
      </div>
      <div className="sidebar-section-label">Navigation</div>
      <div className="sidebar-nav">
        {NAV.map((item) => (
          <button
            key={item.id}
            className="sidebar-link"
            data-active={route === item.id}
            onClick={() => onNavigate(item.id)}
            aria-current={route === item.id ? 'page' : undefined}
            aria-label={item.label}
          >
            <Icon name={item.icon} />
            <span className="sidebar-link-label">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="sidebar-status" role="status" aria-live="polite">
        <div className="sidebar-status-row">
          <span className="pulse-dot" data-state={apiOk ? 'ok' : 'error'} aria-hidden="true" />
          <div className="sidebar-status-text">
            <span>{apiOk ? 'API opérationnelle' : 'API indisponible'}</span>
            <small>vérifié à {time}</small>
          </div>
        </div>
      </div>
    </nav>
  );
}

// AUTRES COMPOSANTS UNIQUEMENT POUR RÉFÉRENCE. PAS MODIFIÉS.
export function Header({ title, breadcrumb }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return (
    <header className="header">
      <div className="header-left">
        <div className="breadcrumb">
          <span>ObRail Europe</span>
          <span className="breadcrumb-sep">/</span>
          {breadcrumb.map((b, i) => (
            <span
              key={i}
              style={{ color: i === breadcrumb.length - 1 ? 'var(--text-secondary)' : undefined }}
            >
              {b}
            </span>
          ))}
        </div>
        <h1 className="header-title">{title}</h1>
      </div>
      <div className="header-right">
        <span className="clock" aria-label="Date et heure">
          {dd}/{mm}/{yyyy} <span className="dash-sep" style={{ width: 12 }} /> {hh}:{mi}:{ss}
        </span>
        <span className="live-badge" role="status" aria-label="Données temps réel">
          <span className="dot" />
          LIVE
        </span>
      </div>
    </header>
  );
}

export function MetricCard({ label, value, sub, trend, icon, accent }) {
  return (
    <div className="metric-card" data-accent={accent || false}>
      <div className="metric-head">
        <span>{label}</span>
        {icon && (
          <span className="metric-icon">
            <Icon name={icon} size={16} />
          </span>
        )}
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-sub">
        {trend && (
          <span className="trend" data-dir={trend.dir}>
            <Icon name={trend.dir === 'up' ? 'arrowUp' : 'arrowDown'} size={12} />
            {trend.value}
          </span>
        )}
        <span>{sub}</span>
      </div>
    </div>
  );
}

export function Badge({ tone, children, role }) {
  return (
    <span className="badge" data-tone={tone} role={role}>
      {children}
    </span>
  );
}

export function StatutBadge({ statut }) {
  const map = {
    actif: { tone: 'success', label: 'Actif' },
    retard: { tone: 'warning', label: 'Retard' },
    incident: { tone: 'danger', label: 'Incident' },
    terminé: { tone: 'neutral', label: 'Terminé' },
  };
  const cfg = map[statut] || { tone: 'neutral', label: statut };
  return (
    <Badge tone={cfg.tone} role="status">
      {cfg.label}
    </Badge>
  );
}

export function TypeBadge({ type }) {
  return (
    <Badge tone={type === 'jour' ? 'day' : 'night'}>{type === 'jour' ? '☼ Jour' : '☾ Nuit'}</Badge>
  );
}

export function BottomNav({ route, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {NAV.map((item) => (
        <button
          key={item.id}
          className="bottom-nav-link"
          data-active={route === item.id}
          onClick={() => onNavigate(item.id)}
          aria-current={route === item.id ? 'page' : undefined}
          aria-label={item.label}
        >
          <Icon name={item.icon} size={20} />
          <span>{item.mobileLabel}</span>
        </button>
      ))}
    </nav>
  );
}
