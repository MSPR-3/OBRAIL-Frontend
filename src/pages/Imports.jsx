import { useState } from 'react';

import { api } from '../api';
import { MetricCard, Badge } from '../components/Layout';
import { useApi } from '../hooks/useApi';

export default function Imports() {
  const [filter, setFilter] = useState('');
  const { data: all, loading: l1, error } = useApi(() => api.imports({ limit: 100 }), []);
  const { data: stats, loading: l2 } = useApi(() => api.importsStats(), []);

  const loading = l1 || l2;

  if (loading)
    return (
      <div className="page" style={{ padding: 32, color: 'var(--text-tertiary)' }}>
        Chargement…
      </div>
    );
  if (error)
    return (
      <div className="page" style={{ padding: 32, color: 'var(--danger)' }}>
        Erreur : {error}
      </div>
    );

  const list = all?.imports ?? [];

  if (!list || list.length === 0)
    return (
      <div className="page" style={{ padding: 32 }}>
        Aucun import.
      </div>
    );

  const filtered = filter ? list.filter((i) => i.statut === filter) : list;
  const dernier = stats?.dernier_import;

  return (
    <div className="page">
      <section className="page-section">
        {dernier && (
          <div
            className="status-banner"
            data-state={dernier.statut === 'succès' ? 'ok' : 'incident'}
          >
            <div className="status-banner-title">
              <span
                className="pulse-dot"
                data-state={dernier.statut === 'succès' ? 'ok' : 'error'}
              />
              {dernier.statut === 'succès'
                ? 'Dernier import réussi'
                : 'Anomalie sur le dernier import'}
            </div>
            <div
              style={{
                display: 'flex',
                gap: 24,
                fontSize: 12,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span>{new Date(dernier.date_import).toLocaleString('fr-FR')}</span>
              <span>{dernier.nb_lignes_importees.toLocaleString('fr-FR')} lignes</span>
            </div>
          </div>
        )}
      </section>

      <section className="page-section">
        <div className="grid-4">
          <MetricCard
            label="Total imports"
            value={stats?.total_imports ?? 0}
            sub="historique_import"
            icon="refresh"
            accent="true"
          />
          <MetricCard
            label="Réussis"
            value={stats?.imports_reussis ?? 0}
            sub={
              stats?.total_imports
                ? `${Math.round((stats.imports_reussis / stats.total_imports) * 100)}% du total`
                : '—'
            }
            icon="server"
            accent="success"
          />
          <MetricCard
            label="Échoués"
            value={stats?.imports_echoues ?? 0}
            sub={
              stats?.total_imports
                ? `${Math.round((stats.imports_echoues / stats.total_imports) * 100)}% du total`
                : '—'
            }
            icon="server"
            accent="danger"
          />
          <MetricCard
            label="Lignes importées"
            value={(stats?.lignes_importees_total ?? 0).toLocaleString('fr-FR')}
            sub="cumulé"
            icon="chart"
          />
        </div>
      </section>

      <section className="panel" style={{ padding: 0 }}>
        <div
          style={{
            padding: '14px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 13,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              fontWeight: 600,
            }}
            id="imports-heading"
          >
            Historique ({filtered.length})
          </div>
          <div className="segmented" role="group" aria-labelledby="imports-heading">
            <button
              data-active={filter === ''}
              onClick={() => setFilter('')}
              aria-pressed={filter === ''}
            >
              Tout
            </button>
            <button
              data-active={filter === 'succès'}
              onClick={() => setFilter('succès')}
              aria-pressed={filter === 'succès'}
            >
              Succès
            </button>
            <button
              data-active={filter === 'partiel'}
              onClick={() => setFilter('partiel')}
              aria-pressed={filter === 'partiel'}
            >
              Partiel
            </button>
            <button
              data-active={filter === 'échec'}
              onClick={() => setFilter('échec')}
              aria-pressed={filter === 'échec'}
            >
              Échec
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" aria-label="Historique des imports de données">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Date import</th>
                <th scope="col" className="num">
                  Lignes importées
                </th>
                <th scope="col">Statut</th>
                <th scope="col">Message</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id_import}>
                  <td className="id-cell">#{i.id_import}</td>
                  <td className="num">{new Date(i.date_import).toLocaleString('fr-FR')}</td>
                  <td className="num">{i.nb_lignes_importees.toLocaleString('fr-FR')}</td>
                  <td>
                    <Badge
                      tone={
                        i.statut === 'succès'
                          ? 'success'
                          : i.statut === 'échec'
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      {i.statut}
                    </Badge>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{i.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel" aria-label="Schéma de la table historique_import">
        <div className="panel-head">
          <h3 className="panel-title" id="schema-heading">
            Schéma de la table
          </h3>
          <Badge tone="neutral">historique_import</Badge>
        </div>
        <pre className="code-block" aria-labelledby="schema-heading">
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
