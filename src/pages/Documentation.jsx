import { useState } from 'react';
import { Icon, Badge } from '../components/Layout';
import { JSONBlock } from '../components/Shared';
import { API_EXAMPLES, OPERATEURS, LIGNES } from '../mockData';

const ENDPOINTS = [
  { id:'trajets-list', method:'GET', path:'/trajets', desc:'Liste paginée et filtrable des trajets',
    params:[
      ['page','integer','non','Numéro de page (défaut 1)'],
      ['limit','integer','non','Lignes par page (max 100)'],
      ['id_operateur','string','non','Filtre par opérateur'],
      ['id_ligne','string','non','Filtre par ligne'],
      ['code_pays_depart','string','non','Code pays ISO 2 (ex. FR)'],
      ['code_pays_arrivee','string','non','Code pays ISO 2'],
      ['type','enum','non','`jour` | `nuit` (calculé sur heure_depart)'],
      ['search','string','non','Texte libre (id, gare, opérateur, service)'],
    ], example: API_EXAMPLES.trajetsList },
  { id:'trajet-detail', method:'GET', path:'/trajets/{id_trajet}', desc:"Détail complet d'un trajet (jointures gare, ligne, opérateur, pays)",
    params:[['id_trajet','string','oui','Identifiant du trajet']],
    example: API_EXAMPLES.trajetDetail },
  { id:'kpi', method:'GET', path:'/stats/kpi', desc:'Indicateurs clés agrégés (totaux, moyennes)',
    params:[], example: API_EXAMPLES.kpi },
  { id:'volumes', method:'GET', path:'/stats/volumes', desc:'Volumes agrégés selon une dimension',
    params:[['groupby','enum','oui','`operateur` | `ligne` | `pays_depart` | `pays_arrivee` | `jour_nuit`']],
    example: API_EXAMPLES.volumesOperateur },
  { id:'comparatif', method:'GET', path:'/stats/comparatif-jour-nuit', desc:'Comparaison jour vs nuit (durée, CO₂)',
    params:[], example: API_EXAMPLES.comparatif },
  { id:'co2', method:'GET', path:'/stats/co2', desc:'Détail des émissions CO₂',
    params:[], example: { co2_total_kg: 612.40, co2_moyen_kg_par_trajet: 10.21, par_operateur: [{ id_operateur:'OP-SNCF', nom:'SNCF', co2_total_kg:130.50 }] } },
  { id:'top', method:'GET', path:'/stats/top-liaisons', desc:'Liaisons les plus fréquentes (groupby gare_depart + gare_arrivee)',
    params:[['limit','integer','non','Nombre de résultats (défaut 10)']],
    example: API_EXAMPLES.topLiaisons },
  { id:'operateurs', method:'GET', path:'/operateurs', desc:'Liste des opérateurs avec compteurs',
    params:[], example: API_EXAMPLES.operateurs },
  { id:'lignes', method:'GET', path:'/lignes', desc:'Liste des lignes avec stats',
    params:[['id_operateur','string','non','Filtre par opérateur'],['search','string','non','Recherche par nom']],
    example: API_EXAMPLES.lignes },
  { id:'gares', method:'GET', path:'/gares', desc:'Liste des gares (avec lat/lng pour affichage carte)',
    params:[
      ['code_pays','string','non','Code pays'],
      ['type_liaison','string','non','nationale | internationale'],
      ['search','string','non','Recherche par nom/ville'],
      ['bbox','string','non','lat_min,lng_min,lat_max,lng_max'],
    ], example: API_EXAMPLES.gares },
  { id:'pays', method:'GET', path:'/pays', desc:'Liste des pays présents en base',
    params:[], example: API_EXAMPLES.pays },
  { id:'imports', method:'GET', path:'/imports', desc:'Historique des imports (table historique_import)',
    params:[
      ['page','integer','non','Page'],
      ['limit','integer','non','Lignes/page'],
      ['statut','enum','non','`succès` | `échec` | `partiel`'],
      ['since','datetime','non','Filtre depuis date'],
    ], example: API_EXAMPLES.imports },
  { id:'imports-stats', method:'GET', path:'/imports/stats', desc:'Statistiques sur les imports',
    params:[], example: API_EXAMPLES.importsStats },
  { id:'health', method:'GET', path:'/health', desc:'Healthcheck (sans authentification)',
    params:[], example: API_EXAMPLES.health },
];

export default function Documentation() {
  const [open, setOpen] = useState({ 'trajets-list': true });
  const toggle = id => setOpen(s => ({ ...s, [id]: !s[id] }));

  return (
    <div className="page">
      <section className="panel">
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:32}}>
          <div>
            <div style={{fontSize:11,fontFamily:'var(--font-display)',letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--text-tertiary)',fontWeight:600,marginBottom:8}}>API REST · v1.0</div>
            <h2 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:600,margin:'0 0 12px'}}>Documentation des endpoints</h2>
            <p style={{color:'var(--text-secondary)',margin:0,maxWidth:640}}>
              API alignée sur le schéma de base : <code>trajet</code>, <code>ligne</code>, <code>operateur</code>, <code>gare</code>, <code>localisation</code>, <code>historique_import</code>.
              14 endpoints au total, format JSON UTF-8.
            </p>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <div style={{padding:'10px 12px',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6}}>
              <div style={{fontSize:10,fontFamily:'var(--font-display)',letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text-tertiary)',fontWeight:600,marginBottom:4}}>Base URL</div>
              <code style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--accent)'}}>http://api.obrail-europe.eu/v1</code>
            </div>
            <div style={{padding:'10px 12px',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6}}>
              <div style={{fontSize:10,fontFamily:'var(--font-display)',letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text-tertiary)',fontWeight:600,marginBottom:4}}>Authentification</div>
              <code style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-primary)'}}>Authorization: Bearer &lt;token&gt;</code>
            </div>
          </div>
        </div>
      </section>

      <section style={{display:'flex',flexDirection:'column',gap:0}}>
        {ENDPOINTS.map(ep => (
          <div key={ep.id} className="accordion" data-open={!!open[ep.id]}>
            <button className="accordion-head" onClick={() => toggle(ep.id)}>
              <Badge tone="success">{ep.method}</Badge>
              <span style={{fontFamily:'var(--font-mono)',fontSize:14,fontWeight:500}}>{ep.path}</span>
              <span style={{color:'var(--text-tertiary)',fontSize:12,marginLeft:12}}>{ep.desc}</span>
              <span className="chevron"><Icon name="chevron" size={14}/></span>
            </button>
            <div className="accordion-body">
              <div className="accordion-body-inner">
                {ep.params.length > 0 && (
                  <>
                    <div style={{fontSize:11,fontFamily:'var(--font-display)',letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text-tertiary)',fontWeight:600,margin:'12px 0 8px'}}>Paramètres</div>
                    <table className="table" style={{marginBottom:16}}>
                      <thead><tr><th>Nom</th><th>Type</th><th>Requis</th><th>Description</th></tr></thead>
                      <tbody>
                        {ep.params.map(([n,t,r,d]) => (
                          <tr key={n}>
                            <td><code style={{fontFamily:'var(--font-mono)',color:'var(--accent)'}}>{n}</code></td>
                            <td style={{color:'var(--text-secondary)',fontFamily:'var(--font-mono)',fontSize:12}}>{t}</td>
                            <td>{r === 'oui' ? <Badge tone="warning">requis</Badge> : <span style={{color:'var(--text-tertiary)'}}>—</span>}</td>
                            <td style={{color:'var(--text-secondary)'}}>{d}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
                <div style={{fontSize:11,fontFamily:'var(--font-display)',letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text-tertiary)',fontWeight:600,margin:'12px 0 8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span>Exemple de réponse</span>
                  <Badge tone="success">200 OK</Badge>
                </div>
                <JSONBlock data={ep.example} />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3 className="panel-title">Codes HTTP</h3>
          <Badge tone="neutral">référence</Badge>
        </div>
        <table className="table">
          <thead><tr><th>Code</th><th>Cas</th></tr></thead>
          <tbody>
            <tr><td><Badge tone="success">200</Badge></td><td>Succès</td></tr>
            <tr><td><Badge tone="warning">400</Badge></td><td>Requête malformée</td></tr>
            <tr><td><Badge tone="warning">401</Badge></td><td>Token manquant ou invalide</td></tr>
            <tr><td><Badge tone="danger">404</Badge></td><td>Ressource inexistante</td></tr>
            <tr><td><Badge tone="warning">422</Badge></td><td>Paramètre hors plage</td></tr>
            <tr><td><Badge tone="danger">429</Badge></td><td>Rate limit dépassé</td></tr>
            <tr><td><Badge tone="danger">500</Badge></td><td>Erreur serveur</td></tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
