import { useEffect, useMemo, useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import { api } from '../api';
import { Icon, Badge } from '../components/Layout';
import { InfoCell, Pagination, ChartTooltip, AXIS_STYLE } from '../components/Shared';
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
import { formatDuree, formatHeure, haversineKm } from '../utils';
import { formatKg, formatEur, equivalences } from '../co2';

const CLASS_COLOR = {
  substitution_possible: 'var(--success)',
  substitution_difficile: 'var(--warning)',
  non_pertinent: 'var(--text-tertiary)',
};

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

/* ---------------- Onglet SIMULATEUR (décideur) ---------------- */

const VERDICT = {
  substitution_possible: { color: 'var(--success)', emoji: '✅', titre: 'Report avion → train conseillé' },
  substitution_difficile: { color: 'var(--warning)', emoji: '◐', titre: 'Report possible, à étudier' },
  non_pertinent: { color: 'var(--text-tertiary)', emoji: '✗', titre: 'Report non pertinent (pas d’offre aérienne)' },
};

const TRAIN_SPEED_KMH = 110; // vitesse commerciale moyenne (avec arrêts) pour estimer la durée

function MetricRow({ label, train, avion, better, fmt }) {
  const cell = (v, side) => {
    const win = better === side;
    return (
      <div
        style={{
          flex: 1,
          textAlign: side === 'train' ? 'right' : 'left',
          fontFamily: 'var(--font-mono)',
          fontWeight: win ? 700 : 500,
          color: win ? 'var(--success)' : 'var(--text-primary)',
        }}
      >
        {side === 'train' && win ? '★ ' : ''}{fmt(v)}{side === 'avion' && win ? ' ★' : ''}
      </div>
    );
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderTop: '1px solid var(--border)' }}>
      {cell(train, 'train')}
      <div style={{ width: 130, textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>{label}</div>
      {cell(avion, 'avion')}
    </div>
  );
}

function SimulateurTab() {
  const { data: model } = useApi(() => api.modelInfo(), []);
  const paysData = useApi(() => api.pays(), []);
  const pays = paysData?.data?.pays ?? [];

  // Repli : si /pays indisponible, on dérive les pays depuis les gares.
  const [paysFallback, setPaysFallback] = useState([]);
  useEffect(() => {
    if (pays.length === 0) {
      api.gares().then((d) => {
        const s = new Set((d?.gares ?? []).map((g) => g.code_pays).filter(Boolean));
        setPaysFallback([...s].sort().map((c) => ({ code_pays: c, nom_pays: c })));
      }).catch(() => {});
    }
  }, [pays.length]);
  const paysList = pays.length ? pays : paysFallback;

  const [depPays, setDepPays] = useState('');
  const [arrPays, setArrPays] = useState('');
  const [depVille, setDepVille] = useState('');
  const [arrVille, setArrVille] = useState('');
  const [depCities, setDepCities] = useState([]);
  const [arrCities, setArrCities] = useState([]);
  const [nuit, setNuit] = useState(false);
  const [dureeTrain, setDureeTrain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [res, setRes] = useState(null); // {pred, cmp}

  // Gares géolocalisées du pays choisi -> villes (dédupliquées, triées).
  function loadCities(code, setter) {
    setter([]);
    if (!code) return;
    api.gares({ code_pays: code }).then((data) => {
      const seen = new Map();
      (data?.gares ?? []).forEach((g) => {
        if (g.latitude == null || g.longitude == null || seen.has(g.ville)) return;
        seen.set(g.ville, { ville: g.ville, code_pays: g.code_pays, lat: g.latitude, lng: g.longitude });
      });
      setter([...seen.values()].sort((a, b) => a.ville.localeCompare(b.ville)));
    }).catch(() => setter([]));
  }
  useEffect(() => { setDepVille(''); loadCities(depPays, setDepCities); }, [depPays]);
  useEffect(() => { setArrVille(''); loadCities(arrPays, setArrCities); }, [arrPays]);

  const dep = depCities.find((c) => c.ville === depVille);
  const arr = arrCities.find((c) => c.ville === arrVille);
  const distance = dep && arr ? haversineKm(dep.lat, dep.lng, arr.lat, arr.lng) : NaN;
  const dureeEstimee = Number.isFinite(distance) ? Math.round((distance / TRAIN_SPEED_KMH) * 60) : 0;
  const dureeMin = Number(dureeTrain) || dureeEstimee;

  async function run() {
    if (!dep || !arr) { setError('Choisis une ville de départ et d’arrivée (géolocalisées).'); return; }
    setLoading(true); setError(null); setRes(null);
    try {
      const obs = {
        code_pays_dep: dep.code_pays,
        code_pays_arr: arr.code_pays,
        duree_minutes: dureeMin,
        heure_decimale: nuit ? 23 : 9,
        is_nuit: nuit ? 1 : 0,
        is_transfrontalier: dep.code_pays !== arr.code_pays ? 1 : 0,
      };
      const [pred, cmp] = await Promise.all([
        api.predict([obs]),
        api.avionCompare({
          dep_lat: dep.lat, dep_lng: dep.lng, dep_ville: dep.ville, dep_pays: dep.code_pays,
          arr_lat: arr.lat, arr_lng: arr.lng, arr_ville: arr.ville, arr_pays: arr.code_pays,
          duree_train_min: dureeMin,
        }),
      ]);
      setRes({ r: pred.results?.[0], cmp });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const cls = res ? topClass(res.r) : null;
  const verdict = cls ? VERDICT[cls] : null;
  const score = res ? Math.round((res.r?.probabilities?.[cls] ?? 0) * 100) : 0;
  const cmp = res?.cmp;

  return (
    <>
      <section className="panel" aria-label="Simulateur de report modal">
        <div className="panel-head">
          <h3 className="panel-title">Simuler une liaison</h3>
          {model?.model_name && <Badge tone="neutral">IA · {model.model_name}</Badge>}
        </div>
        <div className="filters-grid" style={{ marginTop: 12, gridTemplateColumns: 'repeat(2, minmax(150px, 1fr))' }}>
          <div className="field">
            <label className="field-label" htmlFor="sim-dep-pays">Pays de départ</label>
            <select id="sim-dep-pays" className="select" value={depPays} onChange={(e) => setDepPays(e.target.value)}>
              <option value="">— Choisir —</option>
              {paysList.map((p) => <option key={p.code_pays} value={p.code_pays}>{p.code_pays} · {p.nom_pays}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="sim-dep-ville">Ville de départ</label>
            <select id="sim-dep-ville" className="select" value={depVille} onChange={(e) => setDepVille(e.target.value)} disabled={!depPays}>
              <option value="">{depPays ? `— Choisir (${depCities.length}) —` : '— Pays d’abord —'}</option>
              {depCities.map((c) => <option key={c.ville} value={c.ville}>{c.ville}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="sim-arr-pays">Pays d’arrivée</label>
            <select id="sim-arr-pays" className="select" value={arrPays} onChange={(e) => setArrPays(e.target.value)}>
              <option value="">— Choisir —</option>
              {paysList.map((p) => <option key={p.code_pays} value={p.code_pays}>{p.code_pays} · {p.nom_pays}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="sim-arr-ville">Ville d’arrivée</label>
            <select id="sim-arr-ville" className="select" value={arrVille} onChange={(e) => setArrVille(e.target.value)} disabled={!arrPays}>
              <option value="">{arrPays ? `— Choisir (${arrCities.length}) —` : '— Pays d’abord —'}</option>
              {arrCities.map((c) => <option key={c.ville} value={c.ville}>{c.ville}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="sim-periode">Période</label>
            <select id="sim-periode" className="select" value={nuit ? 'nuit' : 'jour'} onChange={(e) => setNuit(e.target.value === 'nuit')}>
              <option value="jour">☀ Jour</option>
              <option value="nuit">◐ Nuit</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="sim-duree">Durée train (min)</label>
            <input id="sim-duree" type="number" min="0" className="input"
              value={dureeTrain} placeholder={dureeEstimee ? `auto : ${dureeEstimee}` : '—'}
              onChange={(e) => setDureeTrain(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 14, flexWrap: 'wrap' }}>
          {Number.isFinite(distance) && <Badge tone="neutral">{Math.round(distance)} km</Badge>}
          <button className="btn" data-variant="primary" onClick={run} disabled={loading || !dep || !arr} style={{ marginLeft: 'auto' }}>
            <Icon name="pulse" size={14} />{loading ? 'Analyse…' : 'Comparer train vs avion'}
          </button>
        </div>
        {error && <div style={{ marginTop: 12, color: 'var(--danger)' }} role="alert">Erreur : {error}</div>}
      </section>

      {res && verdict && (
        <>
          <section className="panel" style={{ borderLeft: `4px solid ${verdict.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: verdict.color }}>{verdict.emoji} {verdict.titre}</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                  {dep.ville} → {arr.ville} · {nuit ? 'nuit' : 'jour'} · confiance IA {score}%
                </div>
              </div>
              {cmp && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>CO₂ évité en prenant le train</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--success)' }}>{formatKg(cmp.co2_evite_kg)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{equivalences(cmp.co2_evite_kg).join(' · ') || '—'}</div>
                </div>
              )}
            </div>
          </section>

          {cmp && (
            <section className="panel">
              <div className="panel-head">
                <h3 className="panel-title">Train vs Avion</h3>
                <Badge tone={cmp.avion.source === 'amadeus' ? 'success' : 'neutral'}>
                  Avion : {cmp.avion.source === 'amadeus' ? 'données Amadeus' : 'estimation'}
                </Badge>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, fontWeight: 700 }}>
                <div style={{ flex: 1, textAlign: 'right' }}>🚆 Train</div>
                <div style={{ width: 130 }} />
                <div style={{ flex: 1 }}>✈ Avion</div>
              </div>
              <MetricRow label="CO₂" train={cmp.train.co2_kg} avion={cmp.avion.co2_kg}
                better={cmp.train.co2_kg <= cmp.avion.co2_kg ? 'train' : 'avion'} fmt={formatKg} />
              <MetricRow label="Temps porte-à-porte" train={cmp.train.duree_min} avion={cmp.avion.duree_min}
                better={cmp.train.duree_min <= cmp.avion.duree_min ? 'train' : 'avion'} fmt={formatDuree} />
              <MetricRow label="Prix estimé" train={cmp.train.prix_eur} avion={cmp.avion.prix_eur}
                better={cmp.train.prix_eur <= cmp.avion.prix_eur ? 'train' : 'avion'} fmt={formatEur} />
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-tertiary)' }}>
                Avion porte-à-porte = temps de vol + ~3 h (accès aéroport, sûreté, transferts).
                {cmp.avion.iata ? ` Vol ${cmp.avion.iata}.` : ''}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

/* ---------------- Page ---------------- */

export default function Prediction() {
  const [tab, setTab] = useState('sim');
  return (
    <div className="page">
      <section className="panel" style={{ padding: 8 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" data-variant={tab === 'sim' ? 'primary' : 'ghost'} onClick={() => setTab('sim')}>
            Simulateur
          </button>
          <button className="btn" data-variant={tab === 'parc' ? 'primary' : 'ghost'} onClick={() => setTab('parc')}>
            Priorisation parc
          </button>
        </div>
      </section>
      {tab === 'sim' && <SimulateurTab />}
      {tab === 'parc' && <ParcTab />}
    </div>
  );
}
