import { api } from './api';
import { typeFromHeure } from './utils';

// Métadonnées d'affichage par classe prédite
export const CLASS_META = {
  substitution_possible: { tone: 'success', label: 'Substitution possible', short: 'Possible' },
  substitution_difficile: { tone: 'warning', label: 'Substitution difficile', short: 'Difficile' },
  non_pertinent: { tone: 'neutral', label: 'Non pertinent', short: 'Non pertinent' },
};

export const PROBA_KEYS = ['substitution_possible', 'substitution_difficile', 'non_pertinent'];

// "08:30:00" -> 8.5
export function heureToDecimal(h) {
  if (typeof h !== 'string' || !h) return 0;
  const [hh = '0', mm = '0'] = h.split(':');
  const dec = Number(hh) + Number(mm) / 60;
  return Math.min(23.99, Math.max(0, dec || 0));
}

// Dérive les 6 features attendues par /predict à partir d'un trajet de /trajets
export function trajetToObs(t) {
  const dep = (t.depart?.code_pays || 'FR').toUpperCase();
  const arr = (t.arrivee?.code_pays || 'FR').toUpperCase();
  return {
    code_pays_dep: dep,
    code_pays_arr: arr,
    duree_minutes: Math.max(0, Number(t.duree_minutes) || 0),
    heure_decimale: heureToDecimal(t.heure_depart),
    is_nuit: typeFromHeure(t.heure_depart) === 'nuit' ? 1 : 0,
    is_transfrontalier: dep !== arr ? 1 : 0,
  };
}

// Classe gagnante d'un résultat (utile si `prediction` absent)
export function topClass(result) {
  if (result?.prediction) return result.prediction;
  const probs = result?.probabilities ?? {};
  let best = null;
  let bestV = -Infinity;
  for (const k of PROBA_KEYS) {
    if ((probs[k] ?? 0) > bestV) {
      bestV = probs[k] ?? 0;
      best = k;
    }
  }
  return best;
}

const BATCH = 500; // /predict est plafonné à 1000 obs/requête côté API

// Prédit une liste d'observations en lots successifs, ordre préservé
export async function predictObservations(observations, { onProgress, signal } = {}) {
  const results = [];
  let model = null;
  for (let i = 0; i < observations.length; i += BATCH) {
    if (signal?.cancelled) throw new Error('Prédiction annulée');
    const chunk = observations.slice(i, i + BATCH);
    const res = await api.predict(chunk);
    results.push(...(res.results || []));
    model = res;
    onProgress?.(Math.min(i + BATCH, observations.length), observations.length);
  }
  return { results, model };
}

// Récupère TOUS les trajets correspondant aux filtres (pagination /trajets)
export async function fetchAllTrajets(params = {}, { onProgress, signal } = {}) {
  const all = [];
  const limit = 100;
  let page = 1;
  let totalPages = 1;
  do {
    if (signal?.cancelled) throw new Error('Récupération annulée');
    const data = await api.trajets({ ...params, page, limit });
    all.push(...(data.results || []));
    totalPages = data.total_pages || 1;
    onProgress?.(all.length, data.total || all.length);
    page += 1;
  } while (page <= totalPages);
  return all;
}

// Échappe une valeur pour CSV
function csvCell(v) {
  const s = v == null ? '' : String(v);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Génère et télécharge un CSV à partir de trajets + résultats alignés par index
export function exportPredictionsCsv(trajets, results, filename = 'predictions_obrail.csv') {
  const header = [
    'id_trajet',
    'depart',
    'pays_dep',
    'arrivee',
    'pays_arr',
    'duree_minutes',
    'heure_depart',
    'type',
    'prediction',
    'proba_substitution_possible',
    'proba_substitution_difficile',
    'proba_non_pertinent',
  ];
  const lines = [header.join(';')];
  trajets.forEach((t, i) => {
    const r = results[i] ?? {};
    const p = r.probabilities ?? {};
    lines.push(
      [
        t.id_trajet,
        t.depart?.ville ?? t.depart?.nom,
        t.depart?.code_pays,
        t.arrivee?.ville ?? t.arrivee?.nom,
        t.arrivee?.code_pays,
        t.duree_minutes,
        t.heure_depart,
        t.type_calcul,
        topClass(r),
        p.substitution_possible ?? '',
        p.substitution_difficile ?? '',
        p.non_pertinent ?? '',
      ]
        .map(csvCell)
        .join(';'),
    );
  });
  const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
