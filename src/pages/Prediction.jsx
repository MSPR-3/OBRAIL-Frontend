import { useState } from 'react';

import { api } from '../api';
import { Icon, Badge } from '../components/Layout';
import { InfoCell, JSONBlock } from '../components/Shared';
import { useApi } from '../hooks/useApi';

const CLASS_META = {
  substitution_possible: { tone: 'success', label: 'Substitution possible' },
  substitution_difficile: { tone: 'warning', label: 'Substitution difficile' },
  non_pertinent: { tone: 'neutral', label: 'Non pertinent' },
};

const PROBA_KEYS = ['substitution_possible', 'substitution_difficile', 'non_pertinent'];

function emptyObs() {
  return {
    code_pays_dep: 'FR',
    code_pays_arr: 'FR',
    duree_minutes: 120,
    heure_decimale: 8.5,
    is_nuit: 0,
    is_transfrontalier: 0,
  };
}

// Construit le payload envoyé à l'API : types numériques stricts attendus par PredictInput
function toPayload(rows) {
  return rows.map((r) => ({
    code_pays_dep: r.code_pays_dep.toUpperCase(),
    code_pays_arr: r.code_pays_arr.toUpperCase(),
    duree_minutes: Number(r.duree_minutes),
    heure_decimale: Number(r.heure_decimale),
    is_nuit: Number(r.is_nuit),
    is_transfrontalier: Number(r.is_transfrontalier),
  }));
}

function ProbaBar({ name, value }) {
  const meta = CLASS_META[name] ?? { tone: 'neutral', label: name };
  const pct = Math.round((value ?? 0) * 1000) / 10;
  const color =
    meta.tone === 'success'
      ? 'var(--success)'
      : meta.tone === 'warning'
        ? 'var(--warning)'
        : 'var(--text-tertiary)';
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          marginBottom: 4,
          color: 'var(--text-secondary)',
        }}
      >
        <span>{meta.label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
          {pct}%
        </span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 4,
          background: 'var(--bg-base)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}

function ResultCard({ result, index }) {
  const meta = CLASS_META[result.prediction] ?? { tone: 'neutral', label: result.prediction };
  const probs = result.probabilities ?? {};
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <div className="panel-eyebrow">Observation #{index + 1}</div>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </div>
      {PROBA_KEYS.map((k) => (
        <ProbaBar key={k} name={k} value={probs[k]} />
      ))}
    </div>
  );
}

export default function Prediction() {
  const [rows, setRows] = useState([emptyObs()]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const paysData = useApi(() => api.pays(), []);
  const pays = paysData?.data?.pays ?? [];

  const setField = (i, key, val) => {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));
  };
  const addRow = () => setRows((rs) => [...rs, emptyObs()]);
  const removeRow = (i) => setRows((rs) => (rs.length > 1 ? rs.filter((_, idx) => idx !== i) : rs));

  async function submit() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.predict(toPayload(rows));
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <section className="panel" aria-label="Paramètres de prédiction">
        <div className="panel-head">
          <h3 className="panel-title">Paramètres d'entrée</h3>
          <Badge tone="neutral">POST /predict</Badge>
        </div>

        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              borderTop: i === 0 ? 'none' : '1px solid var(--border)',
              paddingTop: i === 0 ? 0 : 16,
              marginTop: i === 0 ? 12 : 16,
            }}
          >
            <div
              className="filters-grid"
              style={{ gridTemplateColumns: 'repeat(3, minmax(140px, 1fr)) auto' }}
            >
              <div className="field">
                <label className="field-label" htmlFor={`dep-${i}`}>
                  Pays départ
                </label>
                <select
                  id={`dep-${i}`}
                  className="select"
                  value={row.code_pays_dep}
                  onChange={(e) => setField(i, 'code_pays_dep', e.target.value)}
                >
                  {pays.length === 0 && <option value={row.code_pays_dep}>{row.code_pays_dep}</option>}
                  {pays.map((p) => (
                    <option key={p.code_pays} value={p.code_pays}>
                      {p.code_pays} · {p.nom_pays}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field-label" htmlFor={`arr-${i}`}>
                  Pays arrivée
                </label>
                <select
                  id={`arr-${i}`}
                  className="select"
                  value={row.code_pays_arr}
                  onChange={(e) => setField(i, 'code_pays_arr', e.target.value)}
                >
                  {pays.length === 0 && <option value={row.code_pays_arr}>{row.code_pays_arr}</option>}
                  {pays.map((p) => (
                    <option key={p.code_pays} value={p.code_pays}>
                      {p.code_pays} · {p.nom_pays}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field-label" htmlFor={`duree-${i}`}>
                  Durée (minutes)
                </label>
                <input
                  id={`duree-${i}`}
                  type="number"
                  min="0"
                  step="1"
                  className="input"
                  value={row.duree_minutes}
                  onChange={(e) => setField(i, 'duree_minutes', e.target.value)}
                />
              </div>

              <button
                className="btn"
                data-size="sm"
                onClick={() => removeRow(i)}
                disabled={rows.length === 1}
                aria-label={`Supprimer l'observation ${i + 1}`}
                style={{ alignSelf: 'end', minHeight: 37 }}
              >
                <Icon name="trash" size={14} />
              </button>
            </div>

            <div
              className="filters-grid"
              style={{ gridTemplateColumns: 'repeat(3, minmax(140px, 1fr)) auto', marginTop: 12 }}
            >
              <div className="field">
                <label className="field-label" htmlFor={`heure-${i}`}>
                  Heure départ (décimale)
                </label>
                <input
                  id={`heure-${i}`}
                  type="number"
                  min="0"
                  max="23.99"
                  step="0.25"
                  className="input"
                  value={row.heure_decimale}
                  onChange={(e) => setField(i, 'heure_decimale', e.target.value)}
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor={`nuit-${i}`}>
                  Trajet de nuit
                </label>
                <select
                  id={`nuit-${i}`}
                  className="select"
                  value={row.is_nuit}
                  onChange={(e) => setField(i, 'is_nuit', e.target.value)}
                >
                  <option value={0}>Non</option>
                  <option value={1}>Oui</option>
                </select>
              </div>

              <div className="field">
                <label className="field-label" htmlFor={`front-${i}`}>
                  Transfrontalier
                </label>
                <select
                  id={`front-${i}`}
                  className="select"
                  value={row.is_transfrontalier}
                  onChange={(e) => setField(i, 'is_transfrontalier', e.target.value)}
                >
                  <option value={0}>Non</option>
                  <option value={1}>Oui</option>
                </select>
              </div>

              <span />
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button className="btn" onClick={addRow} aria-label="Ajouter une observation">
            + Ajouter une observation
          </button>
          <button
            className="btn"
            data-variant="primary"
            onClick={submit}
            disabled={loading}
            aria-label="Lancer la prédiction"
          >
            <Icon name="pulse" size={14} />
            {loading ? 'Prédiction…' : 'Prédire'}
          </button>
        </div>
      </section>

      {error && (
        <section className="panel" role="alert">
          <div style={{ color: 'var(--danger)' }}>Erreur : {error}</div>
        </section>
      )}

      {result && (
        <>
          <section className="panel">
            <div className="panel-head">
              <h3 className="panel-title">Résultats</h3>
              <Badge tone="success">{result.count} prédiction(s)</Badge>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <InfoCell label="Modèle" value={result.model_name} />
              <InfoCell label="Observations" value={result.count} />
              <InfoCell label="Source" value={result.model_source ?? '—'} />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 12,
              }}
            >
              {(result.results ?? []).map((r, i) => (
                <ResultCard key={i} result={r} index={i} />
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="section-kicker section-kicker-row">
              <span>Réponse brute</span>
              <Badge tone="success">200 OK</Badge>
            </div>
            <JSONBlock data={result} />
          </section>
        </>
      )}
    </div>
  );
}
