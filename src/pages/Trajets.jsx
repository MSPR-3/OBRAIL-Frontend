import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';

import { api } from '../api';
import { Icon, Badge, TypeBadge } from '../components/Layout';
import { InfoCell, Pagination } from '../components/Shared';
import { useApi } from '../hooks/useApi';
import { CLASS_META, PROBA_KEYS, trajetToObs, predictObservations, topClass } from '../predict';
import { formatDuree, formatHeure } from '../utils';

// Carte du trajet chargée à la demande (leaflet hors bundle principal)
const TrajetMiniMap = lazy(() => import('../components/TrajetMiniMap'));

function PredBadge({ state, result }) {
  if (state === 'loading') return <span className="muted tiny">…</span>;
  if (state === 'error' || !result) return <span style={{ color: 'var(--text-tertiary)' }}>—</span>;
  const cls = topClass(result);
  const meta = CLASS_META[cls] ?? { tone: 'neutral', short: cls };
  const probs = result.probabilities ?? {};
  const pct = Math.round((probs[cls] ?? 0) * 100);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Badge tone={meta.tone}>{meta.short}</Badge>
      <span className="muted tiny" style={{ fontFamily: 'var(--font-mono)' }}>{pct}%</span>
    </span>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia('(max-width: 768px)').matches,
  );

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return isMobile;
}

export default function Trajets() {
  const [search, setSearch] = useState('');
  const [opFilter, setOpFilter] = useState('');
  const [paysDFilter, setPaysDFilter] = useState('');
  const [paysAFilter, setPaysAFilter] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selected, setSelected] = useState(null);
  const [preds, setPreds] = useState({});
  const [predState, setPredState] = useState('idle');
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
  const isMobile = useIsMobile();

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

  // Prédit la classe de substitution pour les trajets de la page courante
  useEffect(() => {
    const list = trajets?.results ?? [];
    if (list.length === 0) {
      setPreds({});
      setPredState('idle');
      return;
    }
    const signal = { cancelled: false };
    setPredState('loading');
    predictObservations(list.map(trajetToObs), { signal })
      .then(({ results }) => {
        if (signal.cancelled) return;
        const map = {};
        list.forEach((t, i) => {
          map[t.id_trajet] = results[i];
        });
        setPreds(map);
        setPredState('done');
      })
      .catch(() => {
        if (!signal.cancelled) setPredState('error');
      });
    return () => {
      signal.cancelled = true;
    };
  }, [trajets]);

  return (
    <div className="page">
      <section className="panel" aria-label="Filtres des trajets">
        <div className="filters-grid">
          <div className="field">
            <label htmlFor="search-depart" className="field-label">
              Ville départ
            </label>
            <div className="input-with-icon">
              <span className="input-icon" aria-hidden="true">
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

      <section className="panel table-panel">
        <div
          className="panel-toolbar"
          role="status"
          aria-live="polite"
        >
          <div className="panel-eyebrow">
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

        {!isMobile && (
          <div className="table-responsive desktop-table">
            <table className="table" aria-label="Liste des trajets ferroviaires">
              <thead>
                <tr>
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
                  <th scope="col">Prédiction IA</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {trajetsList.map((t) => (
                  <tr key={t.id_trajet}>
                    <td>
                      <div className="station">{t.depart?.nom ?? '—'}</div>
                      {(t.depart?.ville || t.depart?.code_pays) && (
                        <div className="station-meta">
                          {[t.depart?.ville, t.depart?.code_pays].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="station">{t.arrivee?.nom ?? '—'}</div>
                      {(t.arrivee?.ville || t.arrivee?.code_pays) && (
                        <div className="station-meta">
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
                    <td
                      className="num"
                      style={{
                        color:
                          Number(t.emission_co2_kg ?? 0) >= 0
                            ? 'var(--success)'
                            : 'var(--danger)',
                        fontWeight: 600,
                      }}
                    >
                      {Number(t.emission_co2_kg ?? 0).toFixed(2)}
                    </td>
                    <td>
                      <PredBadge state={predState} result={preds[t.id_trajet]} />
                    </td>
                    <td>
                      <button
                        className="btn"
                        data-size="sm"
                        onClick={() => setSelected(t)}
                        aria-label={`Voir les détails du trajet ${t.depart?.ville ?? t.depart?.nom ?? 'départ'} vers ${t.arrivee?.ville ?? t.arrivee?.nom ?? 'arrivée'}`}
                      >
                        Détails ›
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isMobile && (
          <div className="mobile-card-list" aria-label="Liste mobile des trajets">
            {trajetsList.map((t) => (
              <article className="data-card trajet-card" key={t.id_trajet}>
                <div className="data-card-head">
                  <div>
                    <div className="data-card-kicker">{t.operateur?.nom ?? 'Trajet'}</div>
                    <h3 className="data-card-title">
                      {t.depart?.ville ?? t.depart?.nom ?? '—'} →{' '}
                      {t.arrivee?.ville ?? t.arrivee?.nom ?? '—'}
                    </h3>
                  </div>
                  <TypeBadge type={t.type_calcul} />
                </div>
                <div className="route-pair">
                  <div>
                    <span>Départ</span>
                    <strong>{t.depart?.nom ?? '—'}</strong>
                    <small>
                      {[t.depart?.ville, t.depart?.code_pays].filter(Boolean).join(' · ') || '—'}
                    </small>
                  </div>
                  <div>
                    <span>Arrivée</span>
                    <strong>{t.arrivee?.nom ?? '—'}</strong>
                    <small>
                      {[t.arrivee?.ville, t.arrivee?.code_pays].filter(Boolean).join(' · ') ||
                        '—'}
                    </small>
                  </div>
                </div>
                <div className="data-card-grid">
                  <div>
                    <span>Départ</span>
                    <strong>{formatHeure(t.heure_depart)}</strong>
                  </div>
                  <div>
                    <span>Arrivée</span>
                    <strong>{formatHeure(t.heure_arrivee)}</strong>
                  </div>
                  <div>
                    <span>Durée</span>
                    <strong>{formatDuree(t.duree_minutes)}</strong>
                  </div>
                  <div>
                    <span>CO₂</span>
                    <strong className="success-value">
                      {Number(t.emission_co2_kg ?? 0).toFixed(2)} kg
                    </strong>
                  </div>
                </div>
                <div className="data-card-foot">
                  <span className="route-tag">{t.ligne?.nom_ligne}</span>
                  <PredBadge state={predState} result={preds[t.id_trajet]} />
                </div>
                <button
                  className="btn"
                  data-size="sm"
                  onClick={() => setSelected(t)}
                  aria-label={`Voir les détails du trajet ${t.depart?.ville ?? t.depart?.nom ?? 'départ'} vers ${t.arrivee?.ville ?? t.arrivee?.nom ?? 'arrivée'}`}
                >
                  Détails ›
                </button>
              </article>
            ))}
          </div>
        )}

        <div className="panel-footer">
          <Pagination
            page={page}
            pages={pages}
            onPage={setPage}
            perPage={perPage}
            onPerPage={(n) => { setPerPage(n); setPage(1); }}
          />
        </div>
      </section>

      <TrajetDrawer
        trajet={selected}
        pred={selected ? preds[selected.id_trajet] : null}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function TrajetDrawer({ trajet, pred, onClose }) {
  const open = !!trajet;
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [detail, setDetail] = useState(null); // détail avec coordonnées gares (GET /trajets/{id})

  useEffect(() => {
    if (!trajet?.id_trajet) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetail(null);
    api
      .trajet(trajet.id_trajet)
      .then((d) => { if (!cancelled) setDetail(d); })
      .catch(() => { if (!cancelled) setDetail(null); });
    return () => { cancelled = true; };
  }, [trajet?.id_trajet]);

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
        aria-label={`Détails du trajet ${trajet.depart?.ville ?? trajet.depart?.nom ?? 'départ'} vers ${trajet.arrivee?.ville ?? trajet.arrivee?.nom ?? 'arrivée'}`}
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
              {[trajet.operateur?.nom, trajet.ligne?.nom_ligne].filter(Boolean).join(' · ')}
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
          <div className="drawer-info-grid">
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

          <div className="section-title" style={{ margin: '24px 0 12px' }}>
            Prédiction IA · substitution avion→train
          </div>
          {pred ? (
            <div
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: 14,
              }}
            >
              <div style={{ marginBottom: 12 }}>
                {(() => {
                  const cls = topClass(pred);
                  const meta = CLASS_META[cls] ?? { tone: 'neutral', label: cls };
                  return <Badge tone={meta.tone}>{meta.label}</Badge>;
                })()}
              </div>
              {PROBA_KEYS.map((k) => {
                const meta = CLASS_META[k];
                const pct = Math.round((pred.probabilities?.[k] ?? 0) * 1000) / 10;
                const color =
                  meta.tone === 'success'
                    ? 'var(--success)'
                    : meta.tone === 'warning'
                      ? 'var(--warning)'
                      : 'var(--text-tertiary)';
                return (
                  <div key={k} style={{ marginBottom: 8 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 12,
                        marginBottom: 3,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span>{meta.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {pct}%
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-base)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="muted tiny">Prédiction indisponible.</div>
          )}

          <div className="section-title" style={{ margin: '24px 0 12px' }}>
            Tracé du trajet
          </div>
          {detail ? (
            <Suspense fallback={<div className="muted tiny">Chargement de la carte…</div>}>
              <TrajetMiniMap dep={detail.depart} arr={detail.arrivee} />
            </Suspense>
          ) : (
            <div className="muted tiny">Chargement du tracé…</div>
          )}
        </div>
      </aside>
    </>
  );
}
