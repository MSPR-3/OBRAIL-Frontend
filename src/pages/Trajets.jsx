import { useState, useCallback } from 'react';
import { Icon, Badge, TypeBadge } from '../components/Layout';
import { InfoCell, Pagination } from '../components/Shared';
import { useApi } from '../hooks/useApi';
import { api } from '../api';
import { formatDuree, formatHeure } from '../utils';

const PER_PAGE = 15;

export default function Trajets() {
  const [search,      setSearch]      = useState('');
  const [opFilter,    setOpFilter]    = useState('');
  const [paysDFilter, setPaysDFilter] = useState('');
  const [paysAFilter, setPaysAFilter] = useState('');
  const [page,        setPage]        = useState(1);
  const [selected,    setSelected]    = useState(null);

  const { data: operateurs } = useApi(() => api.operateurs(), []);
  const paysData = useApi(() => api.pays(), []);
  const pays = paysData?.data?.pays ?? [];

  const queryParams = useCallback(() => {
    const p = { limit: PER_PAGE, page: page };
    if (search)      p.search           = search;
    if (opFilter)    p.id_operateur     = opFilter;
    if (paysDFilter) p.code_pays_depart  = paysDFilter;
    if (paysAFilter) p.code_pays_arrivee = paysAFilter;
    return p;
  }, [search, opFilter, paysDFilter, paysAFilter, page]);

  const { data: trajets, loading, error } = useApi(
    () => api.trajets(queryParams()),
    [search, opFilter, paysDFilter, paysAFilter, page],
  );

  const trajetsList = trajets?.results ?? [];
  const pages = trajets?.total_pages ?? 1;

  const reset = () => {
    setSearch(''); setOpFilter(''); setPaysDFilter(''); setPaysAFilter(''); setPage(1);
  };

  return (
    <div className="page">
      <section className="panel">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr repeat(3, 1fr) auto', gap: 12, alignItems: 'end' }}>
          <div className="field">
            <label className="field-label">Ville départ</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }}>
                <Icon name="search" size={14} />
              </span>
              <input className="input" style={{ paddingLeft: 32 }} placeholder="Paris, Lyon, Berlin…"
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Opérateur</label>
            <select className="select" value={opFilter} onChange={e => { setOpFilter(e.target.value); setPage(1); }}>
              <option value="">Tous</option>
              {(operateurs?.operateurs ?? []).map(o => <option key={o.id_operateur} value={o.id_operateur}>{o.nom}</option>)}
            </select>
          </div>

          <div className="field">
            <label className="field-label">Pays départ</label>
            <select className="select" value={paysDFilter} onChange={e => { setPaysDFilter(e.target.value); setPage(1); }}>
              <option value="">Tous</option>
              {pays.map(p => <option key={p.code_pays} value={p.code_pays}>{p.nom_pays}</option>)}
            </select>
          </div>

          <div className="field">
            <label className="field-label">Pays arrivée</label>
            <select className="select" value={paysAFilter} onChange={e => { setPaysAFilter(e.target.value); setPage(1); }}>
              <option value="">Tous</option>
              {pays.map(p => <option key={p.code_pays} value={p.code_pays}>{p.nom_pays}</option>)}
            </select>
          </div>

          <button className="btn" onClick={reset}>Réinitialiser</button>
        </div>
      </section>

      <section className="panel" style={{ padding: 0 }}>
        <div style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {loading ? 'Chargement…' : `${trajetsList.length} trajets (page ${page} / ${trajets?.total_pages ?? 1})`}
          </div>
          <Badge tone="neutral">GET /trajets</Badge>
        </div>

        {error && <div style={{ padding: 16, color: 'var(--danger)' }}>Erreur : {error}</div>}

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>Départ</th><th>Arrivée</th><th>Heure dép.</th>
                <th>Heure arr.</th><th className="num">Durée</th><th>Type</th>
                <th>Opérateur</th><th>Ligne</th><th className="num">CO₂ (kg)</th><th></th>
              </tr>
            </thead>
            <tbody>
              {trajetsList.map(t => (
                <tr key={t.id_trajet}>
                  <td className="id-cell">{t.id_trajet}</td>
                  <td>
                    <div className="station">{t.depart?.nom}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: 2, marginLeft: 14 }}>
                      {t.depart?.ville} · {t.depart?.code_pays}
                    </div>
                  </td>
                  <td>
                    <div className="station">{t.arrivee?.nom}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: 2, marginLeft: 14 }}>
                      {t.arrivee?.ville} · {t.arrivee?.code_pays}
                    </div>
                  </td>
                  <td className="num">{formatHeure(t.heure_depart)}</td>
                  <td className="num">{formatHeure(t.heure_arrivee)}</td>
                  <td className="num">{formatDuree(t.duree_minutes)}</td>
                  <td><TypeBadge type={t.type_calcul} /></td>
                  <td>{t.operateur?.nom}</td>
                  <td><span className="route-tag">{t.ligne?.nom_ligne}</span></td>
                  <td className="num" style={{ color: 'var(--success)', fontWeight: 600 }}>
                    {Number(t.emission_co2_kg ?? 0).toFixed(2)}
                  </td>
                  <td>
                    <button className="btn" data-size="sm" onClick={() => setSelected(t)}>Détails ›</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)' }}>
          <Pagination page={page} pages={pages} onPage={setPage} perPage={PER_PAGE} onPerPage={() => {}} />
        </div>
      </section>

      <TrajetDrawer trajet={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function TrajetDrawer({ trajet, onClose }) {
  const open = !!trajet;

  if (!trajet) {
    return (
      <>
        <div className="drawer-overlay" data-open={false} onClick={onClose} aria-hidden />
        <aside className="drawer" data-open={false} aria-hidden />
      </>
    );
  }

  return (
    <>
      <div className="drawer-overlay" data-open={open} onClick={onClose} />
      <aside className="drawer" data-open={open} role="dialog" aria-modal="true">
        <div className="drawer-head">
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>
              {trajet.id_trajet}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: '6px 0 8px', fontWeight: 600 }}>
              {trajet.depart?.ville} <span style={{ color: 'var(--accent)' }}>→</span> {trajet.arrivee?.ville}
            </h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <TypeBadge type={trajet.type_calcul} />
              <Badge tone="neutral">{trajet.ligne?.nom_ligne}</Badge>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Fermer">
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="drawer-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <InfoCell label="Gare départ"     value={trajet.depart?.nom}   sub={`${trajet.depart?.ville} · ${trajet.depart?.code_pays}`} />
            <InfoCell label="Gare arrivée"    value={trajet.arrivee?.nom}  sub={`${trajet.arrivee?.ville} · ${trajet.arrivee?.code_pays}`} />
            <InfoCell label="Heure de départ" value={formatHeure(trajet.heure_depart)} />
            <InfoCell label="Heure d'arrivée" value={formatHeure(trajet.heure_arrivee)} />
            <InfoCell label="Durée"           value={formatDuree(trajet.duree_minutes)} sub={`${trajet.duree_minutes} minutes`} />
            <InfoCell label="Émission CO₂"    value={`${Number(trajet.emission_co2_kg ?? 0).toFixed(2)} kg`} accent="success" />
            <InfoCell label="Opérateur"       value={trajet.operateur?.nom} />
            <InfoCell label="Ligne"           value={trajet.ligne?.nom_ligne} />
            <InfoCell label="ID source"       value={trajet.id_service} />
          </div>
        </div>
      </aside>
    </>
  );
}
