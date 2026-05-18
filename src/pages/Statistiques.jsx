import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

import { api } from '../api';
import { MetricCard, Badge } from '../components/Layout';
import { ChartTooltip, AXIS_STYLE, GRID_STYLE } from '../components/Shared';
import { useApi } from '../hooks/useApi';
import { formatDuree, opColor } from '../utils';

export default function Statistiques() {
  const { data: kpi, loading: l1 } = useApi(() => api.kpi(), []);
  const { data: cmp, loading: l2 } = useApi(() => api.comparatif(), []);
  const { data: volLignes, loading: l3 } = useApi(() => api.volumes('ligne'), []);
  const { data: volPays, loading: l4 } = useApi(() => api.volumes('pays_depart'), []);
  const { data: volOps, loading: l5 } = useApi(() => api.volumes('operateur'), []);

  const loading = l1 || l2 || l3 || l4 || l5;

  const topLignes = useMemo(
    () =>
      (volLignes?.repartition ?? [])
        .slice(0, 10)
        .map((r) => ({ name: r.nom_ligne, nb_trajets: r.trajets })),
    [volLignes],
  );

  const paysData = useMemo(
    () => (volPays?.repartition ?? []).map((r) => ({ name: r.code_pays, trajets: r.trajets })),
    [volPays],
  );

  const opData = useMemo(
    () =>
      (volOps?.repartition ?? []).map((o, i) => ({
        name: o.nom,
        trajets: o.trajets,
        co2: o.trajets > 0 ? Math.round((o.co2_total_kg / o.trajets) * 100) / 100 : 0,
        color: opColor(i),
      })),
    [volOps],
  );

  const pieData = [
    { name: 'Jour', value: kpi?.trajets_jour ?? 0, color: 'var(--accent)' },
    { name: 'Nuit', value: kpi?.trajets_nuit ?? 0, color: '#6FA3DB' },
  ];

  const total = kpi?.total_trajets ?? 0;
  const co2Total = kpi?.co2_total_kg ?? 0;
  const co2Moy = kpi?.co2_moyen_kg ?? 0;
  const dureeMoy = kpi?.duree_moyenne_minutes ?? 0;

  if (loading)
    return (
      <div className="page" style={{ padding: 32, color: 'var(--text-tertiary)' }}>
        Chargement…
      </div>
    );
  if (!kpi)
    return (
      <div className="page" style={{ padding: 32 }}>
        Aucune donnée.
      </div>
    );

  return (
    <div className="page">
      <section className="page-section">
        <div className="grid-4">
          <MetricCard
            label="CO₂ total émis"
            value={`${co2Total.toLocaleString('fr-FR')} kg`}
            sub={`sur ${total} trajets`}
            icon="leaf"
            accent="success"
          />
          <MetricCard
            label="CO₂ moyen / trajet"
            value={`${Number(co2Moy).toFixed(5)} kg`}
            sub="emission_co2_kg"
            icon="leaf"
          />
          <MetricCard
            label="Durée moyenne"
            value={formatDuree(dureeMoy)}
            sub={`${dureeMoy} minutes`}
            icon="clock"
          />
          <MetricCard
            label="Lignes actives"
            value={kpi?.total_lignes ?? '—'}
            sub={`${kpi?.total_gares ?? '—'} gares · ${kpi?.total_pays ?? '—'} pays`}
            icon="train"
            accent="true"
          />
        </div>
      </section>
      <section className="page-section">
        <div className="grid-2-12">
          <div className="chart-card" aria-label="Graphique comparatif jour vs nuit" role="img">
            <div className="chart-card-head">
              <div>
                <div className="chart-card-title">Jour vs Nuit</div>
                <div className="chart-card-sub">GET /stats/kpi</div>
              </div>
            </div>
            <div style={{ height: 240 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    stroke="var(--bg-panel)"
                    strokeWidth={2}
                  >
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip unit=" trajets" />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                fontSize: 12,
                paddingTop: 8,
                borderTop: '1px solid var(--border)',
              }}
              role="list"
              aria-label="Répartition des trajets jour et nuit"
            >
              <div style={{ textAlign: 'center' }} role="listitem">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    color: 'var(--text-tertiary)',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: 2 }}
                    aria-hidden="true"
                  />
                  Jour
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 22,
                    fontWeight: 600,
                    marginTop: 4,
                  }}
                >
                  {kpi?.trajets_jour ?? 0}
                </div>
              </div>
              <div style={{ textAlign: 'center' }} role="listitem">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    color: 'var(--text-tertiary)',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{ width: 8, height: 8, background: '#6FA3DB', borderRadius: 2 }}
                    aria-hidden="true"
                  />
                  Nuit
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 22,
                    fontWeight: 600,
                    marginTop: 4,
                  }}
                >
                  {kpi?.trajets_nuit ?? 0}
                </div>
              </div>
            </div>
          </div>

          <div
            className="chart-card"
            aria-label="Graphique trajets et CO₂ par opérateur"
            role="img"
          >
            <div className="chart-card-head">
              <div>
                <div className="chart-card-title">Trajets et CO₂ par opérateur</div>
                <div className="chart-card-sub">GET /stats/volumes?groupby=operateur</div>
              </div>
            </div>
            <div style={{ height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={opData} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <CartesianGrid {...GRID_STYLE} vertical={false} />
                  <XAxis dataKey="name" {...AXIS_STYLE} />
                  <YAxis
                    yAxisId="left"
                    {...AXIS_STYLE}
                    scale="log"
                    domain={[1, 'auto']}
                    allowDataOverflow
                    label={{
                      value: 'log',
                      position: 'insideTopLeft',
                      offset: 4,
                      fill: 'var(--text-tertiary)',
                      fontSize: 9,
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    {...AXIS_STYLE}
                    scale="log"
                    domain={[0.001, 'auto']}
                    allowDataOverflow
                  />
                  <Tooltip cursor={{ fill: 'var(--bg-elevated)' }} content={<ChartTooltip />} />
                  <Bar yAxisId="left" dataKey="trajets" name="Trajets" radius={[4, 4, 0, 0]}>
                    {opData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                  <Bar
                    yAxisId="right"
                    dataKey="co2"
                    name="CO₂ moy (kg)"
                    fill="var(--success)"
                    radius={[4, 4, 0, 0]}
                    opacity={0.5}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="grid-2">
          <div
            className="chart-card"
            aria-label="Graphique top 10 des lignes les plus fréquentées"
            role="img"
          >
            <div className="chart-card-head">
              <div>
                <div className="chart-card-title">Top 10 lignes</div>
                <div className="chart-card-sub">GET /stats/volumes?groupby=ligne</div>
              </div>
            </div>
            <div style={{ height: 280 }}>
              <ResponsiveContainer>
                <BarChart
                  data={topLignes}
                  layout="vertical"
                  margin={{ top: 5, right: 10, bottom: 5, left: 120 }}
                >
                  <CartesianGrid {...GRID_STYLE} horizontal={false} />
                  <XAxis
                    type="number"
                    {...AXIS_STYLE}
                    scale="log"
                    domain={[1, 'auto']}
                    allowDataOverflow
                  />
                  <YAxis type="category" dataKey="name" {...AXIS_STYLE} width={120} />
                  <Tooltip
                    cursor={{ fill: 'var(--bg-elevated)' }}
                    content={<ChartTooltip unit=" trajets" />}
                  />
                  <Bar dataKey="nb_trajets" fill="var(--accent)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card" aria-label="Graphique trajets par pays de départ" role="img">
            <div className="chart-card-head">
              <div>
                <div className="chart-card-title">Trajets par pays de départ</div>
                <div className="chart-card-sub">GET /stats/volumes?groupby=pays_depart</div>
              </div>
            </div>
            <div style={{ height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={paysData} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <CartesianGrid {...GRID_STYLE} vertical={false} />
                  <XAxis dataKey="name" {...AXIS_STYLE} />
                  <YAxis
                    {...AXIS_STYLE}
                    scale="log"
                    domain={[1, 'auto']}
                    allowDataOverflow
                    label={{
                      value: 'log',
                      position: 'insideTopLeft',
                      offset: 4,
                      fill: 'var(--text-tertiary)',
                      fontSize: 9,
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--bg-elevated)' }}
                    content={<ChartTooltip unit=" départs" />}
                  />
                  <Bar dataKey="trajets" fill="var(--info)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section" aria-label="Comparatif jour et nuit">
        <div className="panel">
          <div className="panel-head">
            <h3 className="panel-title" id="comparatif-heading">
              Comparatif Jour vs Nuit
            </h3>
            <Badge tone="neutral">GET /stats/comparatif-jour-nuit</Badge>
          </div>
          <div className="table-responsive">
          <table className="table" aria-labelledby="comparatif-heading">
            <thead>
              <tr>
                <th scope="col">Indicateur</th>
                <th scope="col" className="num" style={{ color: 'var(--accent)' }}>
                  <span aria-hidden="true">☼</span> Jour
                </th>
                <th scope="col" className="num" style={{ color: '#6FA3DB' }}>
                  <span aria-hidden="true">☾</span> Nuit
                </th>
                <th scope="col">Unité</th>
              </tr>
            </thead>
            <tbody>
              {(cmp?.indicateurs ?? []).map((ind) => (
                <tr key={ind.label}>
                  <td>{ind.label}</td>
                  <td className="num">{ind.jour}</td>
                  <td className="num">{ind.nuit}</td>
                  <td>{ind.unite || '—'}</td>
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
