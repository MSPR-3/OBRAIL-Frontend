import { useState, useMemo } from 'react';
import { Icon, Badge, TypeBadge } from '../components/Layout';
import { InfoCell, Pagination } from '../components/Shared';
import {
  ALL_TRAJETS, OPERATEURS, LIGNES,
  gareById, operateurById, ligneById, paysByCode,
  typeFromHeure, formatDuree, formatHeure, paysWithStats
} from '../mockData';

export default function Trajets() {
  const [search, setSearch] = useState('');
  const [opFilter, setOpFilter] = useState('');
  const [ligneFilter, setLigneFilter] = useState('');
  const [paysDFilter, setPaysDFilter] = useState('');
  const [paysAFilter, setPaysAFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return ALL_TRAJETS.filter(t => {
      const gd = gareById(t.id_gare_depart);
      const ga = gareById(t.id_gare_arrivee);
      const op = operateurById(t.id_operateur);
      const tt = typeFromHeure(t.heure_depart);
      if (opFilter && t.id_operateur !== opFilter) return false;
      if (ligneFilter && t.id_ligne !== ligneFilter) return false;
      if (paysDFilter && gd.code_pays !== paysDFilter) return false;
      if (paysAFilter && ga.code_pays !== paysAFilter) return false;
      if (typeFilter && tt !== typeFilter) return false;
      if (s) {
        const blob = (t.id_trajet + ' ' + gd.nom_officiel + ' ' + ga.nom_officiel + ' ' + op.nom + ' ' + t.id_service).toLowerCase();
        if (!blob.includes(s)) return false;
      }
      return true;
    });
  }, [search, opFilter, ligneFilter, paysDFilter, paysAFilter, typeFilter]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const cur = Math.min(page, pages);
  const slice = filtered.slice((cur - 1) * perPage, cur * perPage);
  const paysList = paysWithStats();

  const reset = () => {
    setSearch(''); setOpFilter(''); setLigneFilter('');
    setPaysDFilter(''); setPaysAFilter(''); setTypeFilter(''); setPage(1);
  };

  return (
    <div className="page">
      <section className="panel">
        <div style={{display:'grid',gridTemplateColumns:'2fr repeat(5, 1fr) auto',gap:12,alignItems:'end'}}>
          <div className="field">
            <label className="field-label">Recherche</label>
            <div style={{position:'relative'}}>
              <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-tertiary)',pointerEvents:'none'}}><Icon name="search" size={14}/></span>
              <input className="input" style={{paddingLeft:32}} placeholder="ID trajet, gare, opérateur, service…"
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>
          <div className="field">
            <label className="field-label">Opérateur</label>
            <select className="select" value={opFilter} onChange={e => { setOpFilter(e.target.value); setPage(1); }}>
              <option value="">Tous</option>
              {OPERATEURS.map(o => <option key={o.id_operateur} value={o.id_operateur}>{o.nom}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Ligne</label>
            <select className="select" value={ligneFilter} onChange={e => { setLigneFilter(e.target.value); setPage(1); }}>
              <option value="">Toutes</option>
              {LIGNES.map(l => <option key={l.id_ligne} value={l.id_ligne}>{l.nom_ligne}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Pays départ</label>
            <select className="select" value={paysDFilter} onChange={e => { setPaysDFilter(e.target.value); setPage(1); }}>
              <option value="">Tous</option>
              {paysList.map(p => <option key={p.code_pays} value={p.code_pays}>{p.nom_pays}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Pays arrivée</label>
            <select className="select" value={paysAFilter} onChange={e => { setPaysAFilter(e.target.value); setPage(1); }}>
              <option value="">Tous</option>
              {paysList.map(p => <option key={p.code_pays} value={p.code_pays}>{p.nom_pays}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Type</label>
            <div className="segmented">
              <button data-active={typeFilter===''} onClick={() => { setTypeFilter(''); setPage(1); }}>Tout</button>
              <button data-active={typeFilter==='jour'} onClick={() => { setTypeFilter('jour'); setPage(1); }}>Jour</button>
              <button data-active={typeFilter==='nuit'} onClick={() => { setTypeFilter('nuit'); setPage(1); }}>Nuit</button>
            </div>
          </div>
          <button className="btn" onClick={reset}>Réinitialiser</button>
        </div>
      </section>

      <section className="panel" style={{padding:0}}>
        <div style={{padding:'14px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid var(--border)'}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:13,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text-secondary)',fontWeight:600}}>
            {filtered.length.toLocaleString('fr-FR')} trajets
          </div>
          <Badge tone="neutral">GET /trajets</Badge>
        </div>
        <div style={{overflowX:'auto'}}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>Départ</th><th>Arrivée</th><th>Heure dép.</th>
                <th>Heure arr.</th><th className="num">Durée</th><th>Type</th>
                <th>Opérateur</th><th>Ligne</th><th className="num">CO₂ (kg)</th><th></th>
              </tr>
            </thead>
            <tbody>
              {slice.map(t => {
                const gd = gareById(t.id_gare_depart);
                const ga = gareById(t.id_gare_arrivee);
                const op = operateurById(t.id_operateur);
                const lg = ligneById(t.id_ligne);
                return (
                  <tr key={t.id_trajet}>
                    <td className="id-cell">{t.id_trajet}</td>
                    <td>
                      <div className="station">{gd.nom_officiel}</div>
                      <div style={{fontSize:11,color:'var(--text-tertiary)',fontFamily:'var(--font-mono)',marginTop:2,marginLeft:14}}>{gd.ville} · {gd.code_pays}</div>
                    </td>
                    <td>
                      <div className="station">{ga.nom_officiel}</div>
                      <div style={{fontSize:11,color:'var(--text-tertiary)',fontFamily:'var(--font-mono)',marginTop:2,marginLeft:14}}>{ga.ville} · {ga.code_pays}</div>
                    </td>
                    <td className="num">{formatHeure(t.heure_depart)}</td>
                    <td className="num">{formatHeure(t.heure_arrivee)}</td>
                    <td className="num">{formatDuree(t.duree_minutes)}</td>
                    <td><TypeBadge type={typeFromHeure(t.heure_depart)} /></td>
                    <td>{op.nom}</td>
                    <td><span className="route-tag">{lg.nom_ligne}</span></td>
                    <td className="num" style={{color:'var(--success)',fontWeight:600}}>{Number(t.emission_co2_kg).toFixed(2)}</td>
                    <td>
                      <button className="btn" data-size="sm" onClick={() => setSelected(t)}>Détails ›</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{padding:'14px 24px',borderTop:'1px solid var(--border)'}}>
          <Pagination page={cur} pages={pages} onPage={setPage} perPage={perPage} onPerPage={n => { setPerPage(n); setPage(1); }} />
        </div>
      </section>

      <TrajetDrawerV2 trajet={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function TrajetDrawerV2({ trajet, onClose }) {
  const open = !!trajet;
  const [, forceUpdate] = useState(0);

  // ESC key close
  useState(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!trajet) {
    return (
      <>
        <div className="drawer-overlay" data-open={false} onClick={onClose} aria-hidden />
        <aside className="drawer" data-open={false} aria-hidden />
      </>
    );
  }

  const gd = gareById(trajet.id_gare_depart);
  const ga = gareById(trajet.id_gare_arrivee);
  const op = operateurById(trajet.id_operateur);
  const lg = ligneById(trajet.id_ligne);
  const pd = paysByCode(gd.code_pays);
  const pa = paysByCode(ga.code_pays);
  const type = typeFromHeure(trajet.heure_depart);

  return (
    <>
      <div className="drawer-overlay" data-open={open} onClick={onClose} />
      <aside className="drawer" data-open={open} role="dialog" aria-modal="true">
        <div className="drawer-head">
          <div>
            <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-tertiary)',letterSpacing:'0.1em'}}>
              {trajet.id_trajet} · SERVICE {trajet.id_service}
            </div>
            <h2 style={{fontFamily:'var(--font-display)',fontSize:22,margin:'6px 0 8px',fontWeight:600}}>
              {gd.ville} <span style={{color:'var(--accent)'}}>→</span> {ga.ville}
            </h2>
            <div style={{display:'flex',gap:8}}>
              <TypeBadge type={type} />
              <Badge tone="neutral">{lg.nom_ligne}</Badge>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Fermer"><Icon name="close" size={16}/></button>
        </div>

        <div className="drawer-body">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24}}>
            <InfoCell label="Gare départ" value={gd.nom_officiel} sub={`${gd.ville} · ${pd.nom_pays}`} />
            <InfoCell label="Gare arrivée" value={ga.nom_officiel} sub={`${ga.ville} · ${pa.nom_pays}`} />
            <InfoCell label="Heure de départ" value={formatHeure(trajet.heure_depart)} />
            <InfoCell label="Heure d'arrivée" value={formatHeure(trajet.heure_arrivee)} />
            <InfoCell label="Durée" value={formatDuree(trajet.duree_minutes)} sub={`${trajet.duree_minutes} minutes`} />
            <InfoCell label="Émission CO₂" value={`${Number(trajet.emission_co2_kg).toFixed(2)} kg`} accent="success" />
            <InfoCell label="Opérateur" value={op.nom} sub={op.id_operateur} />
            <InfoCell label="Ligne" value={lg.nom_ligne} sub={lg.id_ligne} />
            <InfoCell label="ID source" value={trajet.id_trajet_source} />
            <InfoCell label="Type liaison départ" value={gd.type_liaison} />
          </div>

          <div className="section-title" style={{marginBottom:12}}>Géolocalisation des gares</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
            <div style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,padding:12}}>
              <div style={{fontSize:10,fontFamily:'var(--font-display)',letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text-tertiary)',fontWeight:600,marginBottom:6}}>Départ</div>
              <div style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-primary)'}}>
                <div>lat: {gd.latitude}</div>
                <div>lng: {gd.longitude}</div>
              </div>
            </div>
            <div style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6,padding:12}}>
              <div style={{fontSize:10,fontFamily:'var(--font-display)',letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text-tertiary)',fontWeight:600,marginBottom:6}}>Arrivée</div>
              <div style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-primary)'}}>
                <div>lat: {ga.latitude}</div>
                <div>lng: {ga.longitude}</div>
              </div>
            </div>
          </div>

          <div style={{padding:12,background:'var(--bg-deep)',border:'1px solid var(--border)',borderRadius:6,fontSize:11,color:'var(--text-tertiary)',fontFamily:'var(--font-mono)',lineHeight:1.7}}>
            <div style={{color:'var(--text-secondary)',marginBottom:4}}>// Champs de la table trajet</div>
            id_trajet · id_service · id_trajet_source<br/>
            heure_depart · heure_arrivee · duree_minutes<br/>
            id_ligne · emission_co2_kg<br/>
            id_gare_depart · id_gare_arrivee · id_operateur
          </div>
        </div>
      </aside>
    </>
  );
}
