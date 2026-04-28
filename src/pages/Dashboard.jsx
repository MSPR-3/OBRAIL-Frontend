import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { MetricCard, Badge, TypeBadge, Icon } from '../components/Layout';
import { ChartTooltip, AXIS_STYLE, GRID_STYLE } from '../components/Shared';
import {
  ALL_TRAJETS, OPERATEURS, LIGNES, GARES, IMPORTS,
  operatorsWithVolumes, topLiaisons, typeFromHeure, formatDuree
} from '../mockData';

export default function Dashboard() {
  const ops = operatorsWithVolumes();
  const top = topLiaisons(5);
  const total = ALL_TRAJETS.length;
  const jour = ALL_TRAJETS.filter(t => typeFromHeure(t.heure_depart) === 'jour').length;
  const nuit = total - jour;
  const co2Total = Math.round(ALL_TRAJETS.reduce((s, t) => s + Number(t.emission_co2_kg), 0) * 100) / 100;
  const lastImports = IMPORTS.slice(0, 3);

  const chartData = ops.map(o => ({ name: o.nom, trajets: o.nb_trajets, color: o.color }));

  return (
    <div className="page">
      <section className="page-section">
        <div className="section-head">
          <h2 className="section-title">Indicateurs clés</h2>
          <span className="section-meta">issus de la table <code>trajet</code></span>
        </div>
        <div className="grid-4">
          <MetricCard label="Total trajets"  value={total.toLocaleString('fr-FR')} sub="enregistrés en base" icon="train" accent="true" />
          <MetricCard label="Trajets jour"   value={jour}  sub={`${Math.round(jour/total*100)}% — départ 06h–21h`} icon="sun" accent="warning" />
          <MetricCard label="Trajets nuit"   value={nuit}  sub={`${Math.round(nuit/total*100)}% — départ 21h–06h`} icon="moon" accent="secondary" />
          <MetricCard label="Opérateurs"     value={OPERATEURS.length} sub={`${LIGNES.length} lignes · ${GARES.length} gares`} icon="server" accent="success" />
        </div>
      </section>

      <section className="page-section">
        <div className="grid-2-12">
          <div className="metric-card" data-accent="true">
            <div className="metric-head"><span>CO₂ total émis</span><span className="metric-icon"><Icon name="leaf" size={16} /></span></div>
            <div className="metric-value">{co2Total.toLocaleString('fr-FR')} <span style={{fontSize:18,color:'var(--text-tertiary)'}}>kg</span></div>
            <div className="metric-sub">moyenne {Math.round(co2Total/total*100)/100} kg / trajet</div>
            <div style={{borderTop:'1px solid var(--border)',marginTop:14,paddingTop:14,display:'flex',flexDirection:'column',gap:8}}>
              <div style={{fontSize:10,fontFamily:'var(--font-display)',letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text-tertiary)',fontWeight:600}}>Top 3 opérateurs (CO₂)</div>
              {ops.slice(0,3).map(o => (
                <div key={o.id_operateur} style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
                  <span style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{width:8,height:8,borderRadius:2,background:o.color}}/>{o.nom}
                  </span>
                  <span className="num" style={{color:'var(--text-secondary)'}}>{o.co2_total_kg.toLocaleString('fr-FR')} kg</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-card-head">
              <div>
                <div className="chart-card-title">Volume de trajets par opérateur</div>
                <div className="chart-card-sub">GET /stats/volumes?groupby=operateur</div>
              </div>
            </div>
            <div style={{height:280}}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{top:10,right:10,bottom:10,left:0}}>
                  <CartesianGrid {...GRID_STYLE} vertical={false} />
                  <XAxis dataKey="name" {...AXIS_STYLE} />
                  <YAxis {...AXIS_STYLE} />
                  <Tooltip cursor={{fill:'var(--bg-elevated)'}} content={<ChartTooltip unit=" trajets" />} />
                  <Bar dataKey="trajets" radius={[4,4,0,0]}>
                    {chartData.map((d,i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="grid-2-12">
          <div className="panel">
            <div className="panel-head">
              <h3 className="panel-title">3 derniers imports</h3>
              <Badge tone="neutral">historique_import</Badge>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {lastImports.map(i => (
                <div key={i.id_import} style={{padding:12,background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:6}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-tertiary)'}}>#{i.id_import} · {new Date(i.date_import).toLocaleString('fr-FR')}</span>
                    <Badge tone={i.statut==='succès'?'success':i.statut==='échec'?'danger':'warning'}>{i.statut}</Badge>
                  </div>
                  <div style={{fontSize:13,color:'var(--text-primary)'}}>{i.message}</div>
                  <div style={{fontSize:11,color:'var(--text-tertiary)',fontFamily:'var(--font-mono)',marginTop:4}}>{i.nb_lignes_importees.toLocaleString('fr-FR')} lignes</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3 className="panel-title">Top 5 liaisons</h3>
              <Badge tone="neutral">par fréquence</Badge>
            </div>
            <table className="table">
              <thead>
                <tr><th>Liaison</th><th>Opérateur</th><th>Type</th><th className="num">Trajets</th><th className="num">Durée moy.</th></tr>
              </thead>
              <tbody>
                {top.map((l,i) => (
                  <tr key={i}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8,fontWeight:500}}>
                        <span style={{width:6,height:6,borderRadius:'50%',background:'var(--accent)'}}/>
                        {l.depart.ville} <span style={{color:'var(--accent)'}}>↔</span> {l.arrivee.ville}
                      </div>
                      <div style={{fontSize:11,color:'var(--text-tertiary)',fontFamily:'var(--font-mono)',marginTop:2,marginLeft:14}}>
                        {l.depart.code_pays} → {l.arrivee.code_pays}
                      </div>
                    </td>
                    <td>{l.operateur}</td>
                    <td><TypeBadge type={l.type_dominant} /></td>
                    <td className="num">{l.trajets}</td>
                    <td className="num" style={{color:'var(--text-secondary)'}}>{formatDuree(l.duree_moyenne_minutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
