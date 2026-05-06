import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

import { api } from '../api';
import { MetricCard, Badge, Icon } from '../components/Layout';
import { ChartTooltip, AXIS_STYLE, GRID_STYLE } from '../components/Shared';
import { useApi } from '../hooks/useApi';
import { opColor } from '../utils';

function Spinner() {
  return (
    <div style={{ padding: 32, color: 'var(--text-tertiary)', textAlign: 'center' }}>
      Chargement…
    </div>
  );
}

export default function Dashboard() {
  const { data: dash, loading: l1 } = useApi(() => api.kpi(), []);
  const { data: ops, loading: l2 } = useApi(() => api.operateurs(), []);
  const { data: co2Stats, loading: l3 } = useApi(() => api.co2(), []);
  const { data: importsResp, loading: l4 } = useApi(() => api.imports({ limit: 3, page: 1 }), []);

  const loading = l1 || l2 || l3 || l4;

  if (loading)
    return (
      <div className="page">
        <Spinner />
      </div>
    );

  const total = dash?.total_trajets ?? 0;
  const nbOps = dash?.total_operateurs ?? 0;
  const nbLignes = dash?.total_lignes ?? 0;
  const nbGares = dash?.total_gares ?? 0;

  const co2Total = co2Stats?.co2_total_kg ?? 0;
  const co2Moy = co2Stats?.co2_moyen_kg_par_trajet ?? 0;

  const chartData = (ops?.operateurs ?? []).map((o, i) => ({
    name: o.nom,
    trajets: o.nb_trajets,
    color: opColor(i),
  }));

  const dernier = importsResp?.imports?.[0];

  return (
    <div className="page">
      <section className="page-section">
        <div className="section-head">
          <h2 className="section-title">Indicateurs clés</h2>
          <span className="section-meta">
            issus de la table <code>trajet</code>
          </span>
        </div>
        <div className="grid-4">
          <MetricCard
            label="Total trajets"
            value={total.toLocaleString('fr-FR')}
            sub="enregistrés en base"
            icon="train"
            accent="true"
          />
          <MetricCard
            label="Opérateurs"
            value={nbOps}
            sub={`${nbLignes} lignes · ${nbGares} gares`}
            icon="server"
            accent="success"
          />
          <MetricCard
            label="CO₂ total"
            value={`${co2Total.toLocaleString('fr-FR')} kg`}
            sub={`${co2Moy} kg / trajet`}
            icon="leaf"
            accent="warning"
          />
          <MetricCard
            label="Pays desservis"
            value={dash?.total_pays ?? 0}
            sub="dans localisation"
            icon="map"
            accent="secondary"
          />
        </div>
      </section>

      <section className="page-section">
        <div className="grid-2-12">
          <div className="metric-card" data-accent="true">
            <div className="metric-head">
              <span>CO₂ par opérateur</span>
              <span className="metric-icon">
                <Icon name="leaf" size={16} />
              </span>
            </div>
            <div
              style={{
                borderTop: '1px solid var(--border)',
                marginTop: 14,
                paddingTop: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--text-tertiary)',
                  fontWeight: 600,
                }}
              >
                CO₂ moyen / trajet
              </div>
              {(co2Stats?.par_operateur ?? []).slice(0, 5).map((e, i) => (
                <div
                  key={e.id_operateur ?? i}
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{ width: 8, height: 8, borderRadius: 2, background: opColor(i) }}
                    />
                    {e.nom ?? '—'}
                  </span>
                  <span className="num" style={{ color: 'var(--text-secondary)' }}>
                    {Number(e.co2_moyen_kg ?? 0).toFixed(2)} kg
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-card-head">
              <div>
                <div className="chart-card-title">Volume de trajets par opérateur</div>
                <div className="chart-card-sub">GET /operateurs</div>
              </div>
            </div>
            <div style={{ height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <CartesianGrid {...GRID_STYLE} vertical={false} />
                  <XAxis dataKey="name" {...AXIS_STYLE} />
                  <YAxis {...AXIS_STYLE} />
                  <Tooltip
                    cursor={{ fill: 'var(--bg-elevated)' }}
                    content={<ChartTooltip unit=" trajets" />}
                  />
                  <Bar dataKey="trajets" radius={[4, 4, 0, 0]}>
                    {chartData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {importsResp?.imports && importsResp.imports.length > 0 && (
        <section className="page-section">
          <div className="panel">
            <div className="panel-head">
              <h3 className="panel-title">3 derniers imports</h3>
              <Badge tone="neutral">historique_import</Badge>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {importsResp?.imports?.map((imp) => (
                <div
                  key={imp.id_import}
                  style={{
                    padding: 12,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      #{imp.id_import} · {new Date(imp.date_import).toLocaleString('fr-FR')}
                    </span>
                    <Badge
                      tone={
                        imp.statut === 'succès'
                          ? 'success'
                          : imp.statut === 'échec'
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      {imp.statut}
                    </Badge>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{imp.message}</div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--text-tertiary)',
                      fontFamily: 'var(--font-mono)',
                      marginTop: 4,
                    }}
                  >
                    {imp.nb_lignes_importees.toLocaleString('fr-FR')} lignes
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
