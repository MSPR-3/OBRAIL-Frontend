import { useMemo, useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import { api } from '../api';
import { Icon, Badge } from '../components/Layout';
import { InfoCell, JSONBlock, Pagination, ChartTooltip, AXIS_STYLE } from '../components/Shared';
import { useApi } from '../hooks/useApi';
import {
  CLASS_META,
  PROBA_KEYS,
  trajetToObs,
  topClass,
  predictObservations,
  fetchAllTrajets,
  exportPredictionsCsv,
} from '../predict';
import { formatDuree, formatHeure } from '../utils';

const CLASS_COLOR = {
  substitution_possible: 'var(--success)',
  substitution_difficile: 'var(--warning)',
  non_pertinent: 'var(--text-tertiary)',
};

function ProbaBar({ name, value }) {
  const meta = CLASS_META[name] ?? { tone: 'neutral', label: name };
  const pct = Math.round((value ?? 0) * 1000) / 10;
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          marginBottom: 4,
          color: 'var(--text-secondary)',
        }}
      >
        <span>{meta.label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
          {pct}%
        </span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 4,
          background: 'var(--bg-base)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{ width: `${pct}%`, height: '100%', background: CLASS_COLOR[name], transition: 'width 0.4s ease' }}
        />
      </div>
    </div>
  );
}

/* ---------------- Onglet PARC ---------------- */

function ParcTab() {
  const paysData = useApi(() => api.pays(), []);
  const { data: operateurs } = useApi(() => api.operateurs(), []);
  const pays = paysData?.data?.pays ?? [];

  const [paysD, setPaysD] = useState('');
  const [paysA, setPaysA] = useState('');
  const [op, setOp] = useState('');
  const [type, setType] = useState('');

  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(null); // 'fetch' | 'predict'
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState(null);
  const cancelRef = useRef(null);

  const [trajets, setTrajets] = useState([]);
  const [results, setResults] = useState([]);
  const [model, setModel] = useState(null);

  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  function filtersToParams() {
    const p = {};
    if (paysD) p.code_pays_depart = paysD;
    if (paysA) p.code_pays_arrivee = paysA;
    if (op) p.id_operateur = op;
    if (type) p.type = type;
    return p;
  }

  async function run() {
    const signal = { cancelled: false };
    cancelRef.current = signal;
    setRunning(true);
    setError(null);
    setResults([]);
    setTrajets([]);
    setModel(null);
    setClassFilter('');
    setPage(1);
    try {
      setPhase('fetch');
      setProgress({ done: 0, total: 0 });
      const list = await fetchAllTrajets(filtersToParams(), {
        signal,
        onProgress: (done, total) => setProgress({ done, total }),
      });
      if (signal.cancelled) return;
      if (list.length === 0) {
        setError('Aucun trajet ne correspond aux filtres.');
        return;
      }
      setPhase('predict');
      setProgress({ done: 0, total: list.length });
      const { results: res, model: mdl } = await predictObservations(list.map(trajetToObs), {
        signal,
        onProgress: (done, total) => setProgress({ done, total }),
      });
      if (signal.cancelled) return;
      setTrajets(list);
      setResults(res);
      setModel(mdl);
    } catch (e) {
      if (!signal.cancelled) setError(e.message);
    } finally {
      setPhase(null);
      setRunning(false);
    }
  }

  function cancel() {
    if (cancelRef.current) cancelRef.current.cancelled = true;
    setRunning(false);
    setPhase(null);
  }

  // Agrégats
  const counts = useMemo(() => {
    const c = { substitution_possible: 0, substitution_difficile: 0, non_pertinent: 0 };
    results.forEach((r) => {
      const cls = topClass(r);
      if (cls in c) c[cls] += 1;
    });
    return c;
  }, [results]);

  const total = results.length;
  const pctOf = (n) => (total ? Math.round((n / total) * 1000) / 10 : 0);

  const chartData = PROBA_KEYS.map((k) => ({
    name: CLASS_META[k].short,
    key: k,
    value: counts[k],
  }));

  // Lignes table (filtrées)
  const rows = useMemo(
    () => trajets.map((t, i) => ({ t, r: results[i], cls: topClass(results[i]) })),
    [trajets, results],
  );
  const filtered = classFilter ? rows.filter((r) => r.cls === classFilter) : rows;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <>
      <section className="panel" aria-label="Filtres du parc">
        <div className="panel-head">
          <h3 className="panel-title">Prédiction sur le parc</h3>
          <Badge tone="neutral">POST /predict · batch</Badge>
        </div>
        <div className="filters-grid" style={{ marginTop: 12 }}>
          <div className="field">
            <label className="field-label" htmlFor="parc-dep">Pays départ</label>
            <select id="parc-dep" className="select" value={paysD} onChange={(e) => setPaysD(e.target.value)}>
              <option value="">Tous</option>
              {pays.map((p) => (
                <option key={p.code_pays} value={p.code_pays}>{p.nom_pays}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="parc-arr">Pays arrivée</label>
            <select id="parc-arr" className="select" value={paysA} onChange={(e) => setPaysA(e.target.value)}>
              <option value="">Tous</option>
              {pays.map((p) => (
                <option key={p.code_pays} value={p.code_pays}>{p.nom_pays}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="parc-op">Opérateur</label>
            <select id="parc-op" className="select" value={op} onChange={(e) => setOp(e.target.value)}>
              <option value="">Tous</option>
              {(operateurs?.operateurs ?? []).map((o) => (
                <option key={o.id_operateur} value={o.id_operateur}>{o.nom}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="parc-type">Type</label>
            <select id="parc-type" className="select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Tous</option>
              <option value="jour">Jour</option>
              <option value="nuit">Nuit</option>
            </select>
          </div>
          {running ? (
            <button className="btn" onClick={cancel} aria-label="Annuler">Annuler</button>
          ) : (
            <button className="btn" data-variant="primary" onClick={run} aria-label="Lancer la prédiction du parc">
              <Icon name="pulse" size={14} />
              Prédire
            </button>
          )}
        </div>

        {running && (
          <div style={{ marginTop: 16 }} role="status" aria-live="polite">
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
              {phase === 'fetch' ? 'Récupération des trajets…' : 'Prédiction en cours…'}{' '}
              {progress.done}/{progress.total || '?'}
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-base)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 16, color: 'var(--danger)' }} role="alert">Erreur : {error}</div>
        )}
      </section>

      {total > 0 && (
        <>
          <section className="panel">
            <div className="panel-head">
              <h3 className="panel-title">Synthèse</h3>
              <Badge tone="success">{total} trajets prédits</Badge>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 12,
                margin: '12px 0 20px',
              }}
            >
              <InfoCell label="Total trajets" value={total} />
              <InfoCell label="Substitution possible" value={`${counts.substitution_possible} · ${pctOf(counts.substitution_possible)}%`} accent="success" />
              <InfoCell label="Substitution difficile" value={`${counts.substitution_difficile} · ${pctOf(counts.substitution_difficile)}%`} />
              <InfoCell label="Non pertinent" value={`${counts.non_pertinent} · ${pctOf(counts.non_pertinent)}%`} />
              <InfoCell label="Modèle" value={model?.model_name ?? '—'} />
            </div>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                  <XAxis dataKey="name" {...AXIS_STYLE} />
                  <YAxis allowDecimals={false} {...AXIS_STYLE} />
                  <Tooltip cursor={{ fill: 'var(--bg-elevated)' }} content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Trajets" radius={[4, 4, 0, 0]}>
                    {chartData.map((d) => (
                      <Cell key={d.key} fill={CLASS_COLOR[d.key]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="panel table-panel">
            <div className="panel-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="panel-eyebrow">{filtered.length} trajets</div>
                <select
                  className="select"
                  style={{ width: 200 }}
                  value={classFilter}
                  onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
                  aria-label="Filtrer par classe prédite"
                >
                  <option value="">Toutes les classes</option>
                  {PROBA_KEYS.map((k) => (
                    <option key={k} value={k}>{CLASS_META[k].label}</option>
                  ))}
                </select>
              </div>
              <button
                className="btn"
                data-size="sm"
                onClick={() => exportPredictionsCsv(filtered.map((r) => r.t), filtered.map((r) => r.r))}
                aria-label="Exporter en CSV"
              >
                <Icon name="external" size={14} />
                Export CSV
              </button>
            </div>
            <div className="table-responsive desktop-table">
              <table className="table" aria-label="Prédictions par trajet">
                <thead>
                  <tr>
                    <th scope="col">Départ</th>
                    <th scope="col">Arrivée</th>
                    <th scope="col" className="num">Durée</th>
                    <th scope="col">Heure</th>
                    <th scope="col">Type</th>
                    <th scope="col">Classe prédite</th>
                    <th scope="col" className="num">Confiance</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map(({ t, r, cls }) => {
                    const meta = CLASS_META[cls] ?? { tone: 'neutral', label: cls };
                    const conf = Math.round((r?.probabilities?.[cls] ?? 0) * 100);
                    return (
                      <tr key={t.id_trajet}>
                        <td>
                          <div className="station">{t.depart?.ville ?? t.depart?.nom ?? '—'}</div>
                          <div className="station-meta">{t.depart?.code_pays}</div>
                        </td>
                        <td>
                          <div className="station">{t.arrivee?.ville ?? t.arrivee?.nom ?? '—'}</div>
                          <div className="station-meta">{t.arrivee?.code_pays}</div>
                        </td>
                        <td className="num">{formatDuree(t.duree_minutes)}</td>
                        <td className="num">{formatHeure(t.heure_depart)}</td>
                        <td>{t.type_calcul}</td>
                        <td><Badge tone={meta.tone}>{meta.label}</Badge></td>
                        <td className="num" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{conf}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="panel-footer">
              <Pagination
                page={page}
                pages={totalPages}
                onPage={setPage}
                perPage={perPage}
                onPerPage={(n) => { setPerPage(n); setPage(1); }}
              />
            </div>
          </section>
        </>
      )}
    </>
  );
}

/* ---------------- Onglet MANUEL ---------------- */

function emptyObs() {
  return {
    code_pays_dep: 'FR',
    code_pays_arr: 'FR',
    duree_minutes: 120,
    heure_decimale: 8.5,
    is_nuit: 0,
    is_transfrontalier: 0,
  };
}

function toPayload(rows) {
  return rows.map((r) => ({
    code_pays_dep: r.code_pays_dep.toUpperCase(),
    code_pays_arr: r.code_pays_arr.toUpperCase(),
    duree_minutes: Number(r.duree_minutes),
    heure_decimale: Number(r.heure_decimale),
    is_nuit: Number(r.is_nuit),
    is_transfrontalier: Number(r.is_transfrontalier),
  }));
}

function ManuelTab() {
  const paysData = useApi(() => api.pays(), []);
  const pays = paysData?.data?.pays ?? [];

  const [rows, setRows] = useState([emptyObs()]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setField = (i, key, val) => setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));
  const addRow = () => setRows((rs) => [...rs, emptyObs()]);
  const removeRow = (i) => setRows((rs) => (rs.length > 1 ? rs.filter((_, idx) => idx !== i) : rs));

  async function submit() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await api.predict(toPayload(rows)));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="panel" aria-label="Paramètres de simulation">
        <div className="panel-head">
          <h3 className="panel-title">Simulation manuelle</h3>
          <Badge tone="neutral">POST /predict</Badge>
        </div>

        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              borderTop: i === 0 ? 'none' : '1px solid var(--border)',
              paddingTop: i === 0 ? 0 : 16,
              marginTop: i === 0 ? 12 : 16,
            }}
          >
            <div className="filters-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(140px, 1fr)) auto' }}>
              <div className="field">
                <label className="field-label" htmlFor={`dep-${i}`}>Pays départ</label>
                <select id={`dep-${i}`} className="select" value={row.code_pays_dep} onChange={(e) => setField(i, 'code_pays_dep', e.target.value)}>
                  {pays.length === 0 && <option value={row.code_pays_dep}>{row.code_pays_dep}</option>}
                  {pays.map((p) => (<option key={p.code_pays} value={p.code_pays}>{p.code_pays} · {p.nom_pays}</option>))}
                </select>
              </div>
              <div className="field">
                <label className="field-label" htmlFor={`arr-${i}`}>Pays arrivée</label>
                <select id={`arr-${i}`} className="select" value={row.code_pays_arr} onChange={(e) => setField(i, 'code_pays_arr', e.target.value)}>
                  {pays.length === 0 && <option value={row.code_pays_arr}>{row.code_pays_arr}</option>}
                  {pays.map((p) => (<option key={p.code_pays} value={p.code_pays}>{p.code_pays} · {p.nom_pays}</option>))}
                </select>
              </div>
              <div className="field">
                <label className="field-label" htmlFor={`duree-${i}`}>Durée (minutes)</label>
                <input id={`duree-${i}`} type="number" min="0" step="1" className="input" value={row.duree_minutes} onChange={(e) => setField(i, 'duree_minutes', e.target.value)} />
              </div>
              <button className="btn" data-size="sm" onClick={() => removeRow(i)} disabled={rows.length === 1} aria-label={`Supprimer l'observation ${i + 1}`} style={{ alignSelf: 'end', minHeight: 37 }}>
                <Icon name="trash" size={14} />
              </button>
            </div>
            <div className="filters-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(140px, 1fr)) auto', marginTop: 12 }}>
              <div className="field">
                <label className="field-label" htmlFor={`heure-${i}`}>Heure départ (décimale)</label>
                <input id={`heure-${i}`} type="number" min="0" max="23.99" step="0.25" className="input" value={row.heure_decimale} onChange={(e) => setField(i, 'heure_decimale', e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label" htmlFor={`nuit-${i}`}>Trajet de nuit</label>
                <select id={`nuit-${i}`} className="select" value={row.is_nuit} onChange={(e) => setField(i, 'is_nuit', e.target.value)}>
                  <option value={0}>Non</option>
                  <option value={1}>Oui</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label" htmlFor={`front-${i}`}>Transfrontalier</label>
                <select id={`front-${i}`} className="select" value={row.is_transfrontalier} onChange={(e) => setField(i, 'is_transfrontalier', e.target.value)}>
                  <option value={0}>Non</option>
                  <option value={1}>Oui</option>
                </select>
              </div>
              <span />
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button className="btn" onClick={addRow} aria-label="Ajouter une observation">+ Ajouter une observation</button>
          <button className="btn" data-variant="primary" onClick={submit} disabled={loading} aria-label="Lancer la prédiction">
            <Icon name="pulse" size={14} />
            {loading ? 'Prédiction…' : 'Prédire'}
          </button>
        </div>
      </section>

      {error && (
        <section className="panel" role="alert">
          <div style={{ color: 'var(--danger)' }}>Erreur : {error}</div>
        </section>
      )}

      {result && (
        <>
          <section className="panel">
            <div className="panel-head">
              <h3 className="panel-title">Résultats</h3>
              <Badge tone="success">{result.count} prédiction(s)</Badge>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
              <InfoCell label="Modèle" value={result.model_name} />
              <InfoCell label="Observations" value={result.count} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {(result.results ?? []).map((r, i) => {
                const cls = topClass(r);
                const meta = CLASS_META[cls] ?? { tone: 'neutral', label: cls };
                return (
                  <div key={i} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div className="panel-eyebrow">Observation #{i + 1}</div>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </div>
                    {PROBA_KEYS.map((k) => (<ProbaBar key={k} name={k} value={r.probabilities?.[k]} />))}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel">
            <div className="section-kicker section-kicker-row">
              <span>Réponse brute</span>
              <Badge tone="success">200 OK</Badge>
            </div>
            {(() => {
              // model_source = chemin interne du fichier modèle → masqué côté utilisateur
              const { model_source, ...safe } = result;
              void model_source;
              return <JSONBlock data={safe} />;
            })()}
          </section>
        </>
      )}
    </>
  );
}

/* ---------------- Page ---------------- */

export default function Prediction() {
  const [tab, setTab] = useState('parc');
  return (
    <div className="page">
      <section className="panel" style={{ padding: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" data-variant={tab === 'parc' ? 'primary' : 'ghost'} onClick={() => setTab('parc')}>
            Parc complet
          </button>
          <button className="btn" data-variant={tab === 'manuel' ? 'primary' : 'ghost'} onClick={() => setTab('manuel')}>
            Simulation manuelle
          </button>
        </div>
      </section>
      {tab === 'parc' ? <ParcTab /> : <ManuelTab />}
    </div>
  );
}
