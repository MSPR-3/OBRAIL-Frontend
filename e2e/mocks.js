export const KPI_MOCK = {
  total_trajets: 1250,
  trajets_jour: 820,
  trajets_nuit: 430,
  total_operateurs: 5,
  total_lignes: 28,
  total_gares: 142,
  total_pays: 12,
  co2_total_kg: 3145.67,
  co2_moyen_kg: 2.52,
  duree_moyenne_minutes: 187,
};

export const OPERATEURS_MOCK = {
  operateurs: [
    { id_operateur: 'SNCF', nom: 'SNCF Voyageurs', nb_trajets: 520, nb_lignes: 12 },
    { id_operateur: 'DB', nom: 'Deutsche Bahn', nb_trajets: 380, nb_lignes: 9 },
    { id_operateur: 'NS', nom: 'Nederlandse Spoorwegen', nb_trajets: 210, nb_lignes: 5 },
  ],
};

export const CO2_MOCK = {
  co2_total_kg: 3145.67,
  co2_moyen_kg_par_trajet: 2.52,
  par_operateur: [
    { id_operateur: 'SNCF', nom: 'SNCF Voyageurs', co2_total_kg: 1310.4, co2_moyen_kg: 2.52 },
    { id_operateur: 'DB',   nom: 'Deutsche Bahn',   co2_total_kg: 957.2,  co2_moyen_kg: 2.52 },
  ],
  par_ligne_top10: [],
};

export const TRAJETS_MOCK = {
  page: 1, limit: 15, total: 1250, total_pages: 84,
  results: [
    {
      id_trajet: 'TJ-001',
      id_service: 'SV-001',
      depart:  { id_gare: 'PAR-NOR', nom: 'Gare du Nord', ville: 'Paris', code_pays: 'FR' },
      arrivee: { id_gare: 'BRU-MID', nom: 'Bruxelles-Midi', ville: 'Bruxelles', code_pays: 'BE' },
      heure_depart: '08:15:00',
      heure_arrivee: '10:35:00',
      duree_minutes: 140,
      type_calcul: 'jour',
      emission_co2_kg: 1.87,
      ligne:    { id_ligne: 'L-TH1', nom_ligne: 'Thalys Paris-Bruxelles' },
      operateur: { id_operateur: 'THALYS', nom: 'Thalys' },
    },
  ],
};

export const IMPORTS_LIST_MOCK = {
  page: 1, limit: 100, total: 3,
  imports: [
    { id_import: 3, date_import: '2024-03-15T10:30:00Z', nb_lignes_importees: 1250, statut: 'succès', message: 'Import complet' },
    { id_import: 2, date_import: '2024-03-14T09:00:00Z', nb_lignes_importees: 980,  statut: 'partiel', message: 'Import partiel' },
    { id_import: 1, date_import: '2024-03-13T08:00:00Z', nb_lignes_importees: 0,    statut: 'échec',   message: 'Erreur connexion' },
  ],
};

export const IMPORTS_STATS_MOCK = {
  total_imports: 3,
  imports_reussis: 1,
  imports_echoues: 1,
  imports_partiels: 1,
  taux_reussite: 0.333,
  dernier_import: { date_import: '2024-03-15T10:30:00Z', statut: 'succès', nb_lignes_importees: 1250 },
  lignes_importees_total: 2230,
};

export const COMPARATIF_MOCK = {
  indicateurs: [
    { label: 'Nombre de trajets', jour: 820, nuit: 430, unite: '' },
    { label: 'Durée moyenne', jour: 182, nuit: 196, unite: 'min' },
    { label: 'Émission CO₂ moyenne', jour: 2.41, nuit: 2.71, unite: 'kg' },
    { label: 'Émission CO₂ totale', jour: 1977.22, nuit: 1165.13, unite: 'kg' },
  ],
};

export const VOLUMES_OP_MOCK = {
  groupby: 'operateur', total: 1250,
  repartition: [
    { id_operateur: 'SNCF', nom: 'SNCF Voyageurs', trajets: 520, co2_total_kg: 1310.4, part: 0.416 },
    { id_operateur: 'DB',   nom: 'Deutsche Bahn',   trajets: 380, co2_total_kg: 957.2,  part: 0.304 },
  ],
};

export const VOLUMES_LIGNE_MOCK = {
  groupby: 'ligne', total: 1250,
  repartition: [
    { id_ligne: 'L-001', nom_ligne: 'Thalys Paris-Bruxelles', trajets: 145, co2_total_kg: 271.15, part: 0.116 },
    { id_ligne: 'L-002', nom_ligne: 'Eurostar London-Paris', trajets: 130, co2_total_kg: 243.1,  part: 0.104 },
  ],
};

export const VOLUMES_PAYS_MOCK = {
  groupby: 'pays_depart', total: 1250,
  repartition: [
    { code_pays: 'FR', trajets: 520, co2_total_kg: 1310.4, part: 0.416 },
    { code_pays: 'DE', trajets: 380, co2_total_kg: 957.2,  part: 0.304 },
  ],
};

export const PAYS_MOCK = {
  pays: [
    { code_pays: 'FR', nom_pays: 'France', nb_gares: 42, nb_trajets_depart: 520 },
    { code_pays: 'DE', nom_pays: 'Allemagne', nb_gares: 38, nb_trajets_depart: 380 },
    { code_pays: 'BE', nom_pays: 'Belgique', nb_gares: 18, nb_trajets_depart: 210 },
  ],
};

export function setupApiMocks(page) {
  const BASE = 'http://localhost:8000';
  return Promise.all([
    page.route(`${BASE}/stats/kpi`,                   r => r.fulfill({ json: KPI_MOCK })),
    page.route(`${BASE}/stats/co2`,                   r => r.fulfill({ json: CO2_MOCK })),
    page.route(`${BASE}/stats/comparatif-jour-nuit`,  r => r.fulfill({ json: COMPARATIF_MOCK })),
    page.route(`${BASE}/stats/volumes*`,              r => {
      const url = new URL(r.request().url());
      const g = url.searchParams.get('groupby') ?? 'operateur';
      const map = { operateur: VOLUMES_OP_MOCK, ligne: VOLUMES_LIGNE_MOCK, pays_depart: VOLUMES_PAYS_MOCK };
      r.fulfill({ json: map[g] ?? VOLUMES_OP_MOCK });
    }),
    page.route(`${BASE}/operateurs`,                  r => r.fulfill({ json: OPERATEURS_MOCK })),
    page.route(`${BASE}/trajets*`,                    r => r.fulfill({ json: TRAJETS_MOCK })),
    page.route(`${BASE}/pays`,                        r => r.fulfill({ json: PAYS_MOCK })),
    page.route(`${BASE}/imports/stats`,               r => r.fulfill({ json: IMPORTS_STATS_MOCK })),
    page.route(`${BASE}/imports*`,                    r => r.fulfill({ json: IMPORTS_LIST_MOCK })),
    page.route(`${BASE}/health`,                      r => r.fulfill({ json: { status: 'ok', timestamp: new Date().toISOString(), version: '3.0.0', components: { db: 'ok' } } })),
  ]);
}
