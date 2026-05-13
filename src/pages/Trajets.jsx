import { useState, useCallback, useRef, useEffect } from 'react';

import { api } from '../api';
import { Icon, Badge, TypeBadge } from '../components/Layout';
import { InfoCell, Pagination } from '../components/Shared';
import { useApi } from '../hooks/useApi';
import { formatDuree, formatHeure } from '../utils';

export default function Trajets() {
  const [search, setSearch] = useState('');
  const [opFilter, setOpFilter] = useState('');
  const [paysDFilter, setPaysDFilter] = useState('');
  const [paysAFilter, setPaysAFilter] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selected, setSelected] = useState(null);
  const searchRef = useRef(null);

  const { data: operateurs } = useApi(() => api.operateurs(), []);
  const paysData = useApi(() => api.pays(), []);
  const pays = paysData?.data?.pays ?? [];

  const queryParams = useCallback(() => {
    const p = { limit: perPage, page: page };
    if (search) p.search = search;
    if (opFilter) p.id_operateur = opFilter;
    if (paysDFilter) p.code_pays_depart = paysDFilter;
    if (paysAFilter) p.code_pays_arrivee = paysAFilter;
    return p;
  }, [search, opFilter, paysDFilter, paysAFilter, page, perPage]);

  const {
    data: trajets,
    loading,
    error,
  } = useApi(() => api.trajets(queryParams()), [search, opFilter, paysDFilter, paysAFilter, page, perPage]);

  const trajetsList = trajets?.results ?? [];
  const pages = trajets?.total_pages ?? 1;

  const reset = () => {
    setSearch('');
    setOpFilter('');
    setPaysDFilter('');
    setPaysAFilter('');
    setPage(1);
    setPerPage(15);
  };

  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  return (
    <div className="page">
      <section className="panel" aria-label="Filtres des trajets">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr repeat(3, 1fr) auto',
            gap: 12,
            alignItems: 'end',
          }}
        >
          <div className="field">
            <label htmlFor="search-depart" className="field-label">
              Ville départ
            </label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)',
                  pointerEvents: 'none',
                }}
                aria-hidden="true"
              >
                <Icon name="search" size={14} />
              </span>
              <input
                id="search-depart"
                ref={searchRef}
                className="input"
                style={{ paddingLeft: 32 }}
                placeholder="Paris, Lyon, Berlin…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="filter-operateur" className="field-label">
              Opérateur
            </label>
            <select
              id="filter-operateur"
              className="select"
              value={opFilter}
              onChange={(e) => {
                setOpFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tous</option>
              {(operateurs?.operateurs ?? []).map((o) => (
                <option key={o.id_operateur} value={o.id_operateur}>
                  {o.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="filter-pays-depart" className="field-label">
              Pays départ
            </label>
            <select
              id="filter-pays-depart"
              className="select"
              value={paysDFilter}
              onChange={(e) => {
                setPaysDFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tous</option>
              {pays.map((p) => (
                <option key={p.code_pays} value={p.code_pays}>
                  {p.nom_pays}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="filter-pays-arrivee" className="field-label">
              Pays arrivée
            </label>
            <select
              id="filter-pays-arrivee"
              className="select"
              value={paysAFilter}
              onChange={(e) => {
                setPaysAFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tous</option>
              {pays.map((p) => (
                <option key={p.code_pays} value={p.code_pays}>
                  {p.nom_pays}
                </option>
              ))}
            </select>
          </div>

          <button className="btn" onClick={reset} aria-label="Réinitialiser tous les filtres">
            Réinitialiser
          </button>
        </div>
      </section>

      <section className="panel" style={{ padding: 0 }}>
        <div
          style={{
            padding: '14px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border)',
          }}
          role="status"
          aria-live="polite"
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 13,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            {loading
              ? 'Chargement…'
              : `${trajetsList.length} trajets (page ${page} / ${trajets?.total_pages ?? 1})`}
          </div>
          <Badge tone="neutral">GET /trajets</Badge>
        </div>

        {error && (
          <div style={{ padding: 16, color: 'var(--danger)' }} role="alert">
            Erreur : {error}
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className="table" aria-label="Liste des trajets ferroviaires">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Départ</th>
                <th scope="col">Arrivée</th>
                <th scope="col">Heure dép.</th>
                <th scope="col">Heure arr.</th>
                <th scope="col" className="num">
                  Durée
                </th>
                <th scope="col">Type</th>
                <th scope="col">Opérateur</th>
                <th scope="col">Ligne</th>
                <th scope="col" className="num">
                  CO₂ (kg)
                </th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {trajetsList.map((t) => (
                <tr key={t.id_trajet}>
                  <td className="id-cell">{t.id_trajet}</td>
                  <td>
                    <div className="station">{t.depart?.nom ?? '—'}</div>
                    {(t.depart?.ville || t.depart?.code_pays) && (
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--text-tertiary)',
                          fontFamily: 'var(--font-mono)',
                          marginTop: 2,
                          marginLeft: 14,
                        }}
                      >
                        {[t.depart?.ville, t.depart?.code_pays].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="station">{t.arrivee?.nom ?? '—'}</div>
                    {(t.arrivee?.ville || t.arrivee?.code_pays) && (
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--text-tertiary)',
                          fontFamily: 'var(--font-mono)',
                          marginTop: 2,
                          marginLeft: 14,
                        }}
                      >
                        {[t.arrivee?.ville, t.arrivee?.code_pays].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </td>
                  <td className="num">{formatHeure(t.heure_depart)}</td>
                  <td className="num">{formatHeure(t.heure_arrivee)}</td>
                  <td className="num">{formatDuree(t.duree_minutes)}</td>
                  <td>
                    <TypeBadge type={t.type_calcul} />
                  </td>
                  <td>{t.operateur?.nom}</td>
                  <td>
                    <span className="route-tag">{t.ligne?.nom_ligne}</span>
                  </td>
                  <td className="num" style={{ color: Number(t.emission_co2_kg ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                    {Number(t.emission_co2_kg ?? 0).toFixed(2)}
                  </td>
                  <td>
                    <button
                      className="btn"
                      data-size="sm"
                      onClick={() => setSelected(t)}
                      aria-label={`Voir les détails du trajet ${t.id_trajet}`}
                    >
                      Détails ›
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)' }}>
          <Pagination
            page={page}
            pages={pages}
            onPage={setPage}
            perPage={perPage}
            onPerPage={(n) => { setPerPage(n); setPage(1); }}
          />
        </div>
      </section>

      <TrajetDrawer trajet={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function TrajetDrawer({ trajet, onClose }) {
  const open = !!trajet;
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (open && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (!open) return;
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Tab') {
        const focusable = drawerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!trajet) {
    return (
      <>
        <div className="drawer-overlay" data-open={false} onClick={onClose} aria-hidden="true" />
        <aside className="drawer" data-open={false} aria-hidden="true" />
      </>
    );
  }

  return (
    <>
      <div className="drawer-overlay" data-open={open} onClick={onClose} />
      <aside
        className="drawer"
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-label={`Détails du trajet ${trajet.id_trajet}`}
        ref={drawerRef}
      >
        <div className="drawer-head">
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-tertiary)',
                letterSpacing: '0.1em',
              }}
            >
              {trajet.id_trajet}
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                margin: '6px 0 8px',
                fontWeight: 600,
              }}
            >
              {trajet.depart?.ville ?? trajet.depart?.nom ?? '—'}{' '}
              <span style={{ color: 'var(--accent)' }} aria-hidden="true">
                →
              </span>{' '}
              {trajet.arrivee?.ville ?? trajet.arrivee?.nom ?? '—'}
            </h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <TypeBadge type={trajet.type_calcul} />
              <Badge tone="neutral">{trajet.ligne?.nom_ligne}</Badge>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            className="drawer-close"
            onClick={onClose}
            aria-label="Fermer le panneau de détails"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="drawer-body">
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}
          >
            <InfoCell
              label="Gare départ"
              value={trajet.depart?.nom ?? '—'}
              sub={[trajet.depart?.ville, trajet.depart?.code_pays].filter(Boolean).join(' · ') || undefined}
            />
            <InfoCell
              label="Gare arrivée"
              value={trajet.arrivee?.nom ?? '—'}
              sub={[trajet.arrivee?.ville, trajet.arrivee?.code_pays].filter(Boolean).join(' · ') || undefined}
            />
            <InfoCell label="Heure de départ" value={formatHeure(trajet.heure_depart)} />
            <InfoCell label="Heure d'arrivée" value={formatHeure(trajet.heure_arrivee)} />
            <InfoCell
              label="Durée"
              value={formatDuree(trajet.duree_minutes)}
              sub={`${trajet.duree_minutes} minutes`}
            />
            <InfoCell
              label="Émission CO₂"
              value={`${Number(trajet.emission_co2_kg ?? 0).toFixed(2)} kg`}
              accent="success"
            />
            <InfoCell label="Opérateur" value={trajet.operateur?.nom} />
            <InfoCell label="Ligne" value={trajet.ligne?.nom_ligne} />
            <InfoCell label="ID source" value={trajet.id_service} />
          </div>
        </div>
      </aside>
    </>
  );
}
