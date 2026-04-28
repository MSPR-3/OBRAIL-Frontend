import { useState } from 'react';
import { MetricCard, Badge } from '../components/Layout';
import { IMPORTS } from '../mockData';

export default function Imports() {
  const [filter, setFilter] = useState('');
  const all = IMPORTS;
  const filtered = filter ? all.filter(i => i.statut === filter) : all;
  const total = all.length;
  const ok = all.filter(i => i.statut === 'succès').length;
  const ko = all.filter(i => i.statut === 'échec').length;
  const totalLignes = all.reduce((s, i) => s + i.nb_lignes_importees, 0);
  const dernier = all[0];

  return (
    <div className="page">
      <section className="page-section">
        <div className="status-banner" data-state={dernier.statut === 'succès' ? 'ok' : 'incident'}>
          <div className="status-banner-title">
            <span className="pulse-dot" data-state={dernier.statut === 'succès' ? 'ok' : 'error'} />
            {dernier.statut === 'succès' ? 'Dernier import réussi' : 'Anomalie sur le dernier import'}
          </div>
          <div style={{display:'flex',gap:24,fontSize:12,color:'var(--text-secondary)',fontFamily:'var(--font-mono)'}}>
            <span>#{dernier.id_import}</span>
            <span>{new Date(dernier.date_import).toLocaleString('fr-FR')}</span>
            <span>{dernier.nb_lignes_importees.toLocaleString('fr-FR')} lignes</span>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="grid-4">
          <MetricCard label="Total imports" value={total} sub="historique_import" icon="refresh" accent="true" />
          <MetricCard label="Réussis" value={ok} sub={`${Math.round(ok/total*100)}% du total`} icon="server" accent="success" />
          <MetricCard label="Échoués" value={ko} sub={`${Math.round(ko/total*100)}% du total`} icon="server" accent="danger" />
          <MetricCard label="Lignes importées" value={totalLignes.toLocaleString('fr-FR')} sub="cumulé" icon="chart" />
        </div>
      </section>

      <section className="panel" style={{padding:0}}>
        <div style={{padding:'14px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid var(--border)',gap:12}}>
          <div style={{fontFamily:'var(--font-display)',fontSize:13,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text-secondary)',fontWeight:600}}>
            Historique ({filtered.length})
          </div>
          <div className="segmented">
            <button data-active={filter === ''} onClick={() => setFilter('')}>Tout</button>
            <button data-active={filter === 'succès'} onClick={() => setFilter('succès')}>Succès</button>
            <button data-active={filter === 'partiel'} onClick={() => setFilter('partiel')}>Partiel</button>
            <button data-active={filter === 'échec'} onClick={() => setFilter('échec')}>Échec</button>
          </div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>Date import</th><th className="num">Lignes importées</th><th>Statut</th><th>Message</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(i => (
                <tr key={i.id_import}>
                  <td className="id-cell">#{i.id_import}</td>
                  <td className="num">{new Date(i.date_import).toLocaleString('fr-FR')}</td>
                  <td className="num">{i.nb_lignes_importees.toLocaleString('fr-FR')}</td>
                  <td>
                    <Badge tone={i.statut === 'succès' ? 'success' : i.statut === 'échec' ? 'danger' : 'warning'}>
                      {i.statut}
                    </Badge>
                  </td>
                  <td style={{color:'var(--text-secondary)'}}>{i.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3 className="panel-title">Schéma de la table</h3>
          <Badge tone="neutral">historique_import</Badge>
        </div>
        <pre className="code-block">
{`id_import           integer       PK
date_import         timestamp     without time zone
nb_lignes_importees integer
statut              varchar(20)   succès | échec | partiel
message             text`}
        </pre>
      </section>
    </div>
  );
}
