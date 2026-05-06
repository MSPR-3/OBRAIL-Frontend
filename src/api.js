const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function get(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

export const api = {
  kpi:          ()               => get('/stats/kpi'),
  co2:          ()               => get('/stats/co2'),
  comparatif:   ()               => get('/stats/comparatif-jour-nuit'),
  volumes:      (g = 'operateur') => get('/stats/volumes?groupby=' + g),
  topLiaisons:  (n = 10)         => get('/stats/top-liaisons?limit=' + n),
  operateurs:   ()               => get('/operateurs'),
  lignes:       (p = {})         => get('/lignes?' + new URLSearchParams(p)),
  gares:        (p = {})         => get('/gares?' + new URLSearchParams(p)),
  pays:         ()               => get('/pays'),
  trajets:      (p = {})         => get('/trajets?' + new URLSearchParams(p)),
  trajet:       (id)             => get('/trajets/' + id),
  imports:      (p = {})         => get('/imports?' + new URLSearchParams(p)),
  importsStats: ()               => get('/imports/stats'),
  health:       ()               => get('/health'),
};
