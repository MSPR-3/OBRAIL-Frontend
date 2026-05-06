import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

import { Icon, Badge, StatutBadge, TypeBadge } from './Layout';

export const AXIS_STYLE = {
  tick: { fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' },
  axisLine: { stroke: 'var(--border)' },
  tickLine: { stroke: 'var(--border)' },
};
export const GRID_STYLE = { stroke: 'var(--border)', strokeDasharray: '3 4' };

export function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div className="chart-tooltip-row" key={i}>
          <span className="swatch" style={{ background: p.color || p.stroke || p.fill }} />
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
          <span style={{ marginLeft: 'auto', color: 'var(--text-primary)', fontWeight: 600 }}>
            {p.value}
            {unit || ''}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({ data, color, height = 40 }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 4, right: 0, bottom: 4, left: 0 }}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function InfoCell({ label, value, sub, accent }) {
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: 12,
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
        {label}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          marginTop: 4,
          color: accent === 'success' ? 'var(--success)' : 'var(--text-primary)',
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-tertiary)',
            marginTop: 2,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function TimelinePoint({ time, text, tone }) {
  return (
    <div className="timeline-item">
      <span className="timeline-dot" data-tone={tone} />
      <div>
        <div className="timeline-time">{time}</div>
        <div className="timeline-text">{text}</div>
      </div>
    </div>
  );
}

export function TrajetDrawer({ trajet, onClose }) {
  const open = !!trajet;
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div className="drawer-overlay" data-open={open} onClick={onClose} aria-hidden={!open} />
      <aside
        className="drawer"
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-label="Détail du trajet"
      >
        {trajet && (
          <>
            <div className="drawer-head">
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--text-tertiary)',
                    letterSpacing: '0.1em',
                  }}
                >
                  {trajet.id} · TRAIN {trajet.train}
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 22,
                    margin: '6px 0 8px',
                    fontWeight: 600,
                  }}
                >
                  {trajet.dep} <span style={{ color: 'var(--accent)' }}>→</span> {trajet.arr}
                </h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  <TypeBadge type={trajet.type} />
                  <StatutBadge statut={trajet.statut} />
                </div>
              </div>
              <button className="drawer-close" onClick={onClose} aria-label="Fermer le panneau">
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="drawer-body">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <InfoCell
                  label="Départ"
                  value={trajet.dep}
                  sub={`Quai ${trajet.quaiD} · ${trajet.heure}`}
                />
                <InfoCell label="Arrivée" value={trajet.arr} sub={`Quai ${trajet.quaiA}`} />
                <InfoCell label="Date" value={trajet.date} />
                <InfoCell label="Durée" value={trajet.duree} />
                <InfoCell label="Distance" value={`${trajet.km} km`} />
                <InfoCell
                  label="CO₂ économisé vs avion"
                  value={`${trajet.co2} kg`}
                  accent="success"
                />
                <InfoCell label="Opérateur" value={trajet.op} />
                <InfoCell label="N° de train" value={trajet.train} />
              </div>
              <div className="section-title" style={{ marginBottom: 12 }}>
                Chronologie du trajet
              </div>
              <div className="timeline">
                <TimelinePoint time={trajet.heure} text={trajet.dep} tone="success" />
                {trajet.arrets.map((a, i) => (
                  <TimelinePoint key={i} time="—" text={a} tone="warning" />
                ))}
                <TimelinePoint time={`+${trajet.duree}`} text={trajet.arr} tone="success" />
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export function JSONBlock({ data }) {
  const html = useMemo(() => {
    const json = JSON.stringify(data, null, 2);
    return json.replace(
      /("(\\u[\dA-Fa-f]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'k-num';
        if (/^"/.test(match)) cls = /:$/.test(match) ? 'k-key' : 'k-str';
        else if (/true|false/.test(match)) cls = 'k-bool';
        else if (/null/.test(match)) cls = 'k-null';
        return `<span class="${cls}">${match}</span>`;
      },
    );
  }, [data]);
  return <pre className="code-block" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Pagination({ page, pages, onPage, perPage, onPerPage }) {
  const arr = [];
  for (let i = 1; i <= pages; i++) arr.push(i);
  const visible =
    pages <= 7
      ? arr
      : (() => {
          if (page <= 4) return [1, 2, 3, 4, 5, '...', pages];
          if (page >= pages - 3)
            return [1, '...', pages - 4, pages - 3, pages - 2, pages - 1, pages];
          return [1, '...', page - 1, page, page + 1, '...', pages];
        })();
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          color: 'var(--text-secondary)',
        }}
      >
        <span>Lignes par page</span>
        <select
          className="select"
          style={{ width: 70 }}
          value={perPage}
          onChange={(e) => onPerPage(Number(e.target.value))}
        >
          <option>10</option>
          <option>15</option>
          <option>25</option>
          <option>50</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          className="btn"
          data-size="sm"
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          aria-label="Page précédente"
        >
          ‹ Précédent
        </button>
        {visible.map((p, i) =>
          p === '...' ? (
            <span key={i} style={{ padding: '5px 10px', color: 'var(--text-tertiary)' }}>
              …
            </span>
          ) : (
            <button
              key={i}
              className="btn"
              data-size="sm"
              data-variant={p === page ? 'primary' : ''}
              onClick={() => onPage(p)}
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Page ${p}`}
            >
              {p}
            </button>
          ),
        )}
        <button
          className="btn"
          data-size="sm"
          disabled={page === pages}
          onClick={() => onPage(page + 1)}
          aria-label="Page suivante"
        >
          Suivant ›
        </button>
      </div>
    </div>
  );
}
