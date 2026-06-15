import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { api } from '../api';
import { Icon, Badge } from '../components/Layout';
import { useApi } from '../hooks/useApi';
import { CLASS_META, PROBA_KEYS, trajetToObs, topClass, predictObservations } from '../predict';
import { formatDuree, formatHeure } from '../utils';

const MAX_PAGES = 20; // plafond de chargement carte (20×100 = 2000 trajets)

function css(name, fallback) {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

// Recadre la carte sur les points fournis + corrige la taille après montage/transition
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 350);
    if (points.length > 0) {
      map.fitBounds(points, { padding: [32, 32], maxZoom: 8 });
    }
    return () => clearTimeout(t);
  }, [points, map]);
  return null;
}

export default function Carte() {
  const garesData = useApi(() => api.gares(), []);
  const { data: operateurs } = useApi(() => api.operateurs(), []);
  const paysData = useApi(() => api.pays(), []);
  const pays = paysData?.data?.pays ?? [];

  const [paysD, setPaysD] = useState('');
  const [paysA, setPaysA] = useState('');
  const [op, setOp] = useState('');
  const [type, setType] = useState('');

  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [capped, setCapped] = useState(false);
  const [error, setError] = useState(null);

  const [predOn, setPredOn] = useState(false);
  const [preds, setPreds] = useState([]);
  const [predLoading, setPredLoading] = useState(false);

  // Index gares par id pour retrouver les coordonnées
  const garesById = useMemo(() => {
    const m = {};
    (garesData?.data?.gares ?? []).forEach((g) => {
      m[g.id_gare] = g;
    });
    return m;
  }, [garesData]);

  const garesAvecCoord = useMemo(
    () => (garesData?.data?.gares ?? []).filter((g) => g.latitude != null && g.longitude != null),
    [garesData],
  );

  const bounds = useMemo(
    () => garesAvecCoord.map((g) => [g.latitude, g.longitude]),
    [garesAvecCoord],
  );

  async function loadTrajets() {
    setLoading(true);
    setError(null);
    setPredOn(false);
    setPreds([]);
    try {
      const params = {};
      if (paysD) params.code_pays_depart = paysD;
      if (paysA) params.code_pays_arrivee = paysA;
      if (op) params.id_operateur = op;
      if (type) params.type = type;
      const all = [];
      let page = 1;
      let totalPages = 1;
      do {
        const data = await api.trajets({ ...params, page, limit: 100 });
        all.push(...(data.results || []));
        totalPages = data.total_pages || 1;
        page += 1;
      } while (page <= totalPages && page <= MAX_PAGES);
      setCapped(totalPages > MAX_PAGES);
      setTrajets(all);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function togglePred() {
    if (predOn) {
      setPredOn(false);
      return;
    }
    if (trajets.length === 0) return;
    setPredLoading(true);
    setError(null);
    try {
      const { results } = await predictObservations(trajets.map(trajetToObs));
      setPreds(results);
      setPredOn(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setPredLoading(false);
    }
  }

  const C = {
    accent: css('--accent', '#F5C518'),
    success: css('--success', '#16a34a'),
    warning: css('--warning', '#d97706'),
    tertiary: css('--text-tertiary', '#9aa0a6'),
    line: css('--border', '#d0d0d0'),
  };
  const CLASS_COLOR = {
    substitution_possible: C.success,
    substitution_difficile: C.warning,
    non_pertinent: C.tertiary,
  };

  // Segments traçables (les 2 gares ont des coordonnées)
  const segments = useMemo(() => {
    const segs = [];
    trajets.forEach((t, i) => {
      const gd = garesById[t.depart?.id_gare];
      const ga = garesById[t.arrivee?.id_gare];
      if (gd?.latitude == null || ga?.latitude == null) return;
      segs.push({
        i,
        t,
        positions: [
          [gd.latitude, gd.longitude],
          [ga.latitude, ga.longitude],
        ],
      });
    });
    return segs;
  }, [trajets, garesById]);

  function lineColor(i) {
    if (!predOn) return C.accent;
    return CLASS_COLOR[topClass(preds[i])] ?? C.tertiary;
  }

  return (
    <div className="page">
      <section className="panel" aria-label="Filtres de la carte">
        <div className="filters-grid">
          <div className="field">
            <label className="field-label" htmlFor="map-dep">Pays départ</label>
            <select id="map-dep" className="select" value={paysD} onChange={(e) => setPaysD(e.target.value)}>
              <option value="">Tous</option>
              {pays.map((p) => (<option key={p.code_pays} value={p.code_pays}>{p.nom_pays}</option>))}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="map-arr">Pays arrivée</label>
            <select id="map-arr" className="select" value={paysA} onChange={(e) => setPaysA(e.target.value)}>
              <option value="">Tous</option>
              {pays.map((p) => (<option key={p.code_pays} value={p.code_pays}>{p.nom_pays}</option>))}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="map-op">Opérateur</label>
            <select id="map-op" className="select" value={op} onChange={(e) => setOp(e.target.value)}>
              <option value="">Tous</option>
              {(operateurs?.operateurs ?? []).map((o) => (<option key={o.id_operateur} value={o.id_operateur}>{o.nom}</option>))}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="map-type">Type</label>
            <select id="map-type" className="select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Tous</option>
              <option value="jour">Jour</option>
              <option value="nuit">Nuit</option>
            </select>
          </div>
          <button className="btn" data-variant="primary" onClick={loadTrajets} disabled={loading} aria-label="Afficher les trajets sur la carte">
            <Icon name="map" size={14} />
            {loading ? 'Chargement…' : 'Afficher'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginTop: 14 }}>
          <Badge tone="neutral">{garesAvecCoord.length} gares</Badge>
          <Badge tone="neutral">{segments.length} trajets tracés</Badge>
          {capped && <span className="muted tiny">Limité à {MAX_PAGES * 100} trajets (affinez les filtres).</span>}
          <button
            className="btn"
            data-size="sm"
            onClick={togglePred}
            disabled={trajets.length === 0 || predLoading}
            aria-pressed={predOn}
            style={{ marginLeft: 'auto' }}
          >
            <Icon name="pulse" size={14} />
            {predLoading ? 'Prédiction…' : predOn ? 'Masquer prédiction IA' : 'Colorer par prédiction IA'}
          </button>
        </div>

        {predOn && (
          <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
            {PROBA_KEYS.map((k) => (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span style={{ width: 14, height: 4, borderRadius: 2, background: CLASS_COLOR[k], display: 'inline-block' }} />
                {CLASS_META[k].label}
              </span>
            ))}
          </div>
        )}

        {error && <div style={{ marginTop: 12, color: 'var(--danger)' }} role="alert">Erreur : {error}</div>}
      </section>

      <section className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ height: '70vh', minHeight: 480, width: '100%' }}>
          <MapContainer center={[48, 10]} zoom={4} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds points={bounds} />

            {segments.map(({ i, t, positions }) => (
              <Polyline
                key={t.id_trajet}
                positions={positions}
                pathOptions={{ color: lineColor(i), weight: 2, opacity: 0.55 }}
              >
                <Popup>
                  <strong>{t.depart?.ville ?? t.depart?.nom} → {t.arrivee?.ville ?? t.arrivee?.nom}</strong>
                  <br />
                  {formatHeure(t.heure_depart)} · {formatDuree(t.duree_minutes)} · {t.operateur?.nom ?? '—'}
                  {predOn && (() => {
                    const cls = topClass(preds[i]);
                    const meta = CLASS_META[cls];
                    return meta ? <><br /><span style={{ color: CLASS_COLOR[cls] }}>● {meta.label}</span></> : null;
                  })()}
                </Popup>
              </Polyline>
            ))}

            {garesAvecCoord.map((g) => {
              const activity = (g.nb_departs ?? 0) + (g.nb_arrivees ?? 0);
              return (
                <CircleMarker
                  key={g.id_gare}
                  center={[g.latitude, g.longitude]}
                  radius={Math.min(10, 3 + Math.sqrt(activity))}
                  pathOptions={{ color: C.accent, fillColor: C.accent, fillOpacity: 0.7, weight: 1 }}
                >
                  <Popup>
                    <strong>{g.nom_officiel}</strong>
                    <br />
                    {[g.ville, g.pays].filter(Boolean).join(' · ')}
                    <br />
                    {g.nb_departs} départs · {g.nb_arrivees} arrivées
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </section>
    </div>
  );
}
