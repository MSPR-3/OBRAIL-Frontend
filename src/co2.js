// Aides de vulgarisation CO₂ pour le décideur (équivalences parlantes).

// Ordres de grandeur (kg CO₂ éq.)
const PARIS_NY_ONEWAY_KG = 1000; // ~1 t pour un aller éco transatlantique / passager
const TREE_KG_PER_YEAR = 25; // séquestration ~25 kg CO₂ / arbre / an

export function formatKg(kg) {
  const v = Math.abs(Number(kg) || 0);
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)} t`;
  return `${Math.round(v)} kg`;
}

export function formatEur(eur) {
  if (eur == null) return '—';
  return `${Math.round(Number(eur))} €`;
}

// Renvoie 1 à 2 équivalences lisibles pour un volume de CO₂ évité (kg).
export function equivalences(kg) {
  const v = Math.max(0, Number(kg) || 0);
  const out = [];
  const vols = v / PARIS_NY_ONEWAY_KG;
  if (vols >= 0.1) out.push(`${vols < 1 ? vols.toFixed(1) : Math.round(vols)} aller(s) Paris–New York`);
  const arbres = v / TREE_KG_PER_YEAR;
  if (arbres >= 1) out.push(`${Math.round(arbres)} arbre(s) sur 1 an`);
  return out;
}
