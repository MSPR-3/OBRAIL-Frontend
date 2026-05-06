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
