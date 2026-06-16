export function typeFromHeure(h) {
  if (!h) return 'jour';
  const hh = parseInt(h.slice(0, 2), 10);
  return hh >= 21 || hh < 6 ? 'nuit' : 'jour';
}

export function formatDuree(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${String(m).padStart(2, '0')}`;
}

export function formatHeure(t) {
  return t ? t.slice(0, 5).replace(':', 'h') : '—';
}

const OP_COLORS = [
  'var(--op-1)', 'var(--op-2)', 'var(--op-3)',
  'var(--op-4)', 'var(--op-5)', 'var(--op-6)',
];

export function opColor(index) {
  return OP_COLORS[index % OP_COLORS.length];
}

// Distance grand-cercle (km) entre deux points lat/lng. NaN si coord manquante.
export function haversineKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => v == null || Number.isNaN(Number(v)))) return NaN;
  const R = 6371;
  const toRad = (d) => (Number(d) * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}
