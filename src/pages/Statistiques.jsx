import {
  BarChart, Bar, PieChart, Pie,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import { MetricCard, Badge } from '../components/Layout';
import { ChartTooltip, AXIS_STYLE, GRID_STYLE } from '../components/Shared';
import {
  ALL_TRAJETS, LIGNES, GARES,
  operatorsWithVolumes, comparatifJourNuit, lignesWithStats, paysWithStats,
  typeFromHeure, formatDuree
} from '../mockData';

export default function Statistiques() {
  const ops = operatorsWithVolumes();
  const lignes = lignesWithStats().slice(0, 10);
  const pays = paysWithStats();
  const cmp = comparatifJourNuit();
  const total = ALL_TRAJETS.length;
  const co2Total = Math.round(ALL_TRAJETS.reduce((s, t) => s + Number(t.emission_co2_kg), 0) * 100) / 100;
  const co2Moy = Math.round(co2Total / total * 100) / 100;
  const dureeMoy = Math.round(ALL_TRAJETS.reduce((s, t) => s + t.duree_minutes, 0) / total);

  const pieData = [
    { name: 'Jour', value: cmp.jour.nb, color: 'var(--accent)' },
    { name: 'Nuit', value: cmp.nuit.nb, color: '#6FA3DB' },
  ];
  const opData = ops.map(o => ({ name: o.nom, trajets: o.nb_trajets, co2: o.co2_total_kg, color: o.color }));
  const ligneData = lignes.map(l => ({ name: l.nom_ligne, trajets: l.nb_trajets }));
  const paysData = pays.map(p => ({ name: p.nom_pays, trajets: p.nb_trajets_depart }));

  return (
    <div className="page">
      <section className="page-section">
        <div className="grid-4">
          <MetricCard label="CO₂ total émis" value={`${co2Total.toLocaleString('fr-FR')} kg`} sub={`sur ${total} trajets`} icon="leaf" accent="success" />
          <MetricCard label="CO₂ moyen / trajet" value={`${co2Moy} kg`} sub="emission_co2_kg" icon="leaf" />
          <MetricCard label="Durée moyenne" value={formatDuree(dureeMoy)} sub={`${dureeMoy} minutes`} icon="clock" />
          <MetricCard label="Lignes actives" value={LIGNES.length} sub={`${GARES.length} gares · ${pays.length} pays`} icon="train" accent="true" />
        </div>
      </section>

      <section className="page-section">
        <div className="grid-2-12">
          <div className="chart-card">
            <div className="chart-card-head">
              <div>
                <div className="chart-card-title">Jour vs Nuit</div>
                <div className="chart-card-sub">calculé sur heure_depart</div>
              </div>
            </div>
            <div style={{height:240}}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={85} paddingAngle={3} stroke="var(--bg-panel)" strokeWidth={2}>
                    {pieData.map((d,i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip unit=" trajets" />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{display:'flex',justifyContent:'space-around',fontSize:12,paddingTop:8,borderTop:'1px solid var(--border)'}}>
              <div style={{textAlign:'center'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,color:'var(--text-tertiary)',fontFamily:'var(--font-display)',letterSpacing:'0.12em',textTransform:'uppercase',fontSize:10,fontWeight:600}}>
                  <span style={{width:8,height:8,background:'var(--accent)',borderRadius:2}}/>Jour
                </div>
                <div style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:600,marginTop:4}}>{cmp.jour.nb}</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,color:'var(--text-tertiary)',fontFamily:'var(--font-display)',letterSpacing:'0.12em',textTransform:'uppercase',fontSize:10,fontWeight:600}}>
                  <span style={{width:8,height:8,background:'#6FA3DB',borderRadius:2}}/>Nuit
                </div>
                <div style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:600,marginTop:4}}>{cmp.nuit.nb}</div>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-card-head">
              <div>
                <div className="chart-card-title">Trajets et CO₂ par opérateur</div>
                <div className="chart-card-sub">GET /stats/volumes?groupby=operateur</div>
              </div>
            </div>
            <div style={{height:280}}>
              <ResponsiveContainer>
                <BarChart data={opData} margin={{top:10,right:10,bottom:10,left:0}}>
                  <CartesianGrid {...GRID_STYLE} vertical={false}/>
                  <XAxis dataKey="name" {...AXIS_STYLE}/>
                  <YAxis yAxisId="left" {...AXIS_STYLE}/>
                  <YAxis yAxisId="right" orientation="right" {...AXIS_STYLE}/>
                  <Tooltip cursor={{fill:'var(--bg-elevated)'}} content={<ChartTooltip />} />
                  <Bar yAxisId="left" dataKey="trajets" name="Trajets" radius={[4,4,0,0]}>
                    {opData.map((d,i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                  <Bar yAxisId="right" dataKey="co2" name="CO₂ (kg)" fill="var(--success)" radius={[4,4,0,0]} opacity={0.5}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="grid-2">
          <div className="chart-card">
            <div className="chart-card-head">
              <div>
                <div className="chart-card-title">Top 10 lignes</div>
                <div className="chart-card-sub">GET /stats/volumes?groupby=ligne</div>
              </div>
            </div>
            <div style={{height:280}}>
              <ResponsiveContainer>
                <BarChart data={ligneData} layout="vertical" margin={{top:5,right:10,bottom:5,left:120}}>
                  <CartesianGrid {...GRID_STYLE} horizontal={false}/>
                  <XAxis type="number" {...AXIS_STYLE}/>
                  <YAxis type="category" dataKey="name" {...AXIS_STYLE} width={120}/>
                  <Tooltip cursor={{fill:'var(--bg-elevated)'}} content={<ChartTooltip unit=" trajets" />} />
                  <Bar dataKey="trajets" fill="var(--accent)" radius={[0,4,4,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-card-head">
              <div>
                <div className="chart-card-title">Trajets par pays de départ</div>
                <div className="chart-card-sub">GET /stats/volumes?groupby=pays_depart</div>
              </div>
            </div>
            <div style={{height:280}}>
              <ResponsiveContainer>
                <BarChart data={paysData} margin={{top:10,right:10,bottom:10,left:0}}>
                  <CartesianGrid {...GRID_STYLE} vertical={false}/>
                  <XAxis dataKey="name" {...AXIS_STYLE}/>
                  <YAxis {...AXIS_STYLE}/>
                  <Tooltip cursor={{fill:'var(--bg-elevated)'}} content={<ChartTooltip unit=" départs" />} />
                  <Bar dataKey="trajets" fill="var(--info)" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="panel">
          <div className="panel-head">
            <h3 className="panel-title">Comparatif Jour vs Nuit</h3>
            <Badge tone="neutral">GET /stats/comparatif-jour-nuit</Badge>
          </div>
          <table className="table">
            <thead><tr><th>Indicateur</th><th className="num" style={{color:'var(--accent)'}}>☼ Jour</th><th className="num" style={{color:'#6FA3DB'}}>☾ Nuit</th><th>Unité</th></tr></thead>
            <tbody>
              <tr><td>Nombre de trajets</td><td className="num">{cmp.jour.nb}</td><td className="num">{cmp.nuit.nb}</td><td>—</td></tr>
              <tr><td>Durée moyenne</td><td className="num">{cmp.jour.duree_moy}</td><td className="num">{cmp.nuit.duree_moy}</td><td>min</td></tr>
              <tr><td>Émission CO₂ moyenne</td><td className="num">{cmp.jour.co2_moy}</td><td className="num">{cmp.nuit.co2_moy}</td><td>kg</td></tr>
              <tr><td>Émission CO₂ totale</td><td className="num">{cmp.jour.co2_total}</td><td className="num">{cmp.nuit.co2_total}</td><td>kg</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
