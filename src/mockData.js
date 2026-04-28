// =========================================================
// ObRail Europe v2 — données fictives alignées sur le MPD
// Tables : trajet, ligne, operateur, gare, localisation,
//          historique_import
// =========================================================

export const PAYS = [
  { code_pays: 'FR', nom_pays: 'France' },
  { code_pays: 'DE', nom_pays: 'Allemagne' },
  { code_pays: 'IT', nom_pays: 'Italie' },
  { code_pays: 'ES', nom_pays: 'Espagne' },
  { code_pays: 'BE', nom_pays: 'Belgique' },
  { code_pays: 'AT', nom_pays: 'Autriche' },
  { code_pays: 'CH', nom_pays: 'Suisse' },
  { code_pays: 'NL', nom_pays: 'Pays-Bas' },
  { code_pays: 'PT', nom_pays: 'Portugal' },
  { code_pays: 'CZ', nom_pays: 'Tchéquie' },
];

export const OPERATEURS = [
  { id_operateur: 'OP-SNCF',  nom: 'SNCF',         color: 'var(--op-1)' },
  { id_operateur: 'OP-DB',    nom: 'DB',           color: 'var(--op-2)' },
  { id_operateur: 'OP-TI',    nom: 'Trenitalia',   color: 'var(--op-3)' },
  { id_operateur: 'OP-OBB',   nom: 'ÖBB Nightjet', color: 'var(--op-4)' },
  { id_operateur: 'OP-RENFE', nom: 'Renfe',        color: 'var(--op-5)' },
  { id_operateur: 'OP-THA',   nom: 'Thalys',       color: 'var(--op-6)' },
];

export const LIGNES = [
  { id_ligne: 'L-FR-IT-01', nom_ligne: 'Paris ↔ Milan' },
  { id_ligne: 'L-FR-ES-01', nom_ligne: 'Paris ↔ Madrid' },
  { id_ligne: 'L-FR-BE-01', nom_ligne: 'Paris ↔ Bruxelles' },
  { id_ligne: 'L-AT-FR-01', nom_ligne: 'Vienne ↔ Paris' },
  { id_ligne: 'L-DE-DE-01', nom_ligne: 'Berlin ↔ Munich' },
  { id_ligne: 'L-ES-ES-01', nom_ligne: 'Madrid ↔ Barcelone' },
  { id_ligne: 'L-DE-CH-01', nom_ligne: 'Hambourg ↔ Zurich' },
  { id_ligne: 'L-IT-IT-01', nom_ligne: 'Rome ↔ Naples' },
  { id_ligne: 'L-FR-DE-01', nom_ligne: 'Paris ↔ Strasbourg' },
  { id_ligne: 'L-NL-FR-01', nom_ligne: 'Amsterdam ↔ Paris' },
  { id_ligne: 'L-DE-IT-01', nom_ligne: 'Munich ↔ Venise' },
  { id_ligne: 'L-FR-FR-01', nom_ligne: 'Lyon ↔ Paris' },
  { id_ligne: 'L-DE-BE-01', nom_ligne: 'Cologne ↔ Bruxelles' },
];

export const GARES = [
  { id_gare: 'FRPLY', nom_officiel: 'Paris-Gare de Lyon',   ville: 'Paris',     code_pays: 'FR', type_liaison: 'internationale', latitude: 48.844444, longitude: 2.373611 },
  { id_gare: 'FRPNO', nom_officiel: 'Paris-Nord',           ville: 'Paris',     code_pays: 'FR', type_liaison: 'internationale', latitude: 48.880889, longitude: 2.355000 },
  { id_gare: 'FRPAZ', nom_officiel: 'Paris-Austerlitz',     ville: 'Paris',     code_pays: 'FR', type_liaison: 'internationale', latitude: 48.842222, longitude: 2.365833 },
  { id_gare: 'FRPSL', nom_officiel: "Paris-Gare de l'Est",  ville: 'Paris',     code_pays: 'FR', type_liaison: 'internationale', latitude: 48.876388, longitude: 2.358056 },
  { id_gare: 'FRPMP', nom_officiel: 'Paris-Montparnasse',   ville: 'Paris',     code_pays: 'FR', type_liaison: 'nationale',      latitude: 48.840833, longitude: 2.319167 },
  { id_gare: 'FRPES', nom_officiel: 'Paris-Est',            ville: 'Paris',     code_pays: 'FR', type_liaison: 'internationale', latitude: 48.876388, longitude: 2.358056 },
  { id_gare: 'FRLYP', nom_officiel: 'Lyon Part-Dieu',       ville: 'Lyon',      code_pays: 'FR', type_liaison: 'nationale',      latitude: 45.760833, longitude: 4.859722 },
  { id_gare: 'FRMSC', nom_officiel: 'Marseille St-Charles', ville: 'Marseille', code_pays: 'FR', type_liaison: 'nationale',      latitude: 43.302778, longitude: 5.380556 },
  { id_gare: 'FRBSJ', nom_officiel: 'Bordeaux-St-Jean',     ville: 'Bordeaux',  code_pays: 'FR', type_liaison: 'nationale',      latitude: 44.825833, longitude: -0.557222 },
  { id_gare: 'ITMIC', nom_officiel: 'Milan Centrale',       ville: 'Milan',     code_pays: 'IT', type_liaison: 'internationale', latitude: 45.486389, longitude: 9.205000 },
  { id_gare: 'ITRTE', nom_officiel: 'Rome Termini',         ville: 'Rome',      code_pays: 'IT', type_liaison: 'internationale', latitude: 41.901111, longitude: 12.501944 },
  { id_gare: 'ITNAC', nom_officiel: 'Naples Centrale',      ville: 'Naples',    code_pays: 'IT', type_liaison: 'nationale',      latitude: 40.853056, longitude: 14.272500 },
  { id_gare: 'ITFLO', nom_officiel: 'Florence S.M.N.',      ville: 'Florence',  code_pays: 'IT', type_liaison: 'nationale',      latitude: 43.776389, longitude: 11.248611 },
  { id_gare: 'ITVSL', nom_officiel: 'Venise Santa Lucia',   ville: 'Venise',    code_pays: 'IT', type_liaison: 'internationale', latitude: 45.441111, longitude: 12.320556 },
  { id_gare: 'ESMAT', nom_officiel: 'Madrid Atocha',        ville: 'Madrid',    code_pays: 'ES', type_liaison: 'internationale', latitude: 40.406667, longitude: -3.690278 },
  { id_gare: 'ESMCH', nom_officiel: 'Madrid Chamartín',     ville: 'Madrid',    code_pays: 'ES', type_liaison: 'internationale', latitude: 40.472222, longitude: -3.682500 },
  { id_gare: 'ESBSA', nom_officiel: 'Barcelone-Sants',      ville: 'Barcelone', code_pays: 'ES', type_liaison: 'nationale',      latitude: 41.379167, longitude: 2.139722 },
  { id_gare: 'DEBHB', nom_officiel: 'Berlin Hauptbahnhof',  ville: 'Berlin',    code_pays: 'DE', type_liaison: 'internationale', latitude: 52.525000, longitude: 13.369444 },
  { id_gare: 'DEMHB', nom_officiel: 'Munich Hauptbahnhof',  ville: 'Munich',    code_pays: 'DE', type_liaison: 'internationale', latitude: 48.140278, longitude: 11.558056 },
  { id_gare: 'DEHHA', nom_officiel: 'Hambourg-Altona',      ville: 'Hambourg',  code_pays: 'DE', type_liaison: 'nationale',      latitude: 53.552500, longitude: 9.935278 },
  { id_gare: 'DEFFB', nom_officiel: 'Francfort Hbf',        ville: 'Francfort', code_pays: 'DE', type_liaison: 'internationale', latitude: 50.106944, longitude: 8.662500 },
  { id_gare: 'DESHB', nom_officiel: 'Stuttgart Hbf',        ville: 'Stuttgart', code_pays: 'DE', type_liaison: 'internationale', latitude: 48.783889, longitude: 9.181667 },
  { id_gare: 'DECHB', nom_officiel: 'Cologne Hbf',          ville: 'Cologne',   code_pays: 'DE', type_liaison: 'internationale', latitude: 50.943056, longitude: 6.958889 },
  { id_gare: 'BEBMI', nom_officiel: 'Bruxelles-Midi',       ville: 'Bruxelles', code_pays: 'BE', type_liaison: 'internationale', latitude: 50.835833, longitude: 4.336389 },
  { id_gare: 'ATVHB', nom_officiel: 'Vienne Hauptbahnhof',  ville: 'Vienne',    code_pays: 'AT', type_liaison: 'internationale', latitude: 48.185278, longitude: 16.376667 },
  { id_gare: 'CHZUR', nom_officiel: 'Zurich HB',            ville: 'Zurich',    code_pays: 'CH', type_liaison: 'internationale', latitude: 47.378056, longitude: 8.540278 },
  { id_gare: 'NLAMS', nom_officiel: 'Amsterdam Centraal',   ville: 'Amsterdam', code_pays: 'NL', type_liaison: 'internationale', latitude: 52.378889, longitude: 4.900278 },
];

export function gareById(id) { return GARES.find(g => g.id_gare === id); }
export function paysByCode(c) { return PAYS.find(p => p.code_pays === c); }
export function operateurById(id) { return OPERATEURS.find(o => o.id_operateur === id); }
export function ligneById(id) { return LIGNES.find(l => l.id_ligne === id); }

export function typeFromHeure(h) {
  const hour = parseInt(h.split(':')[0], 10);
  return (hour >= 21 || hour < 6) ? 'nuit' : 'jour';
}

const TRAJETS = [
  { id_trajet: 'OR-2024-0001', id_service: 'SVC-FR-9241', id_trajet_source: 'TI-9241', heure_depart: '09:35:00', heure_arrivee: '16:47:00', duree_minutes: 432, id_ligne: 'L-FR-IT-01', emission_co2_kg: 14.50, id_gare_depart: 'FRPLY', id_gare_arrivee: 'ITMIC', id_operateur: 'OP-TI' },
  { id_trajet: 'OR-2024-0002', id_service: 'SVC-NJ-409',  id_trajet_source: 'OBB-409', heure_depart: '21:00:00', heure_arrivee: '10:45:00', duree_minutes: 825, id_ligne: 'L-FR-ES-01', emission_co2_kg: 24.80, id_gare_depart: 'FRPAZ', id_gare_arrivee: 'ESMCH', id_operateur: 'OP-RENFE' },
  { id_trajet: 'OR-2024-0003', id_service: 'SVC-TH-9418', id_trajet_source: 'THA-9418',heure_depart: '07:13:00', heure_arrivee: '08:35:00', duree_minutes: 82,  id_ligne: 'L-FR-BE-01', emission_co2_kg: 5.60,  id_gare_depart: 'FRPNO', id_gare_arrivee: 'BEBMI', id_operateur: 'OP-THA' },
  { id_trajet: 'OR-2024-0004', id_service: 'SVC-NJ-468',  id_trajet_source: 'OBB-468', heure_depart: '20:28:00', heure_arrivee: '10:43:00', duree_minutes: 855, id_ligne: 'L-AT-FR-01', emission_co2_kg: 21.80, id_gare_depart: 'ATVHB', id_gare_arrivee: 'FRPES', id_operateur: 'OP-OBB' },
  { id_trajet: 'OR-2024-0005', id_service: 'SVC-ICE-587', id_trajet_source: 'DB-587',  heure_depart: '12:04:00', heure_arrivee: '16:06:00', duree_minutes: 242, id_ligne: 'L-DE-DE-01', emission_co2_kg: 10.20, id_gare_depart: 'DEBHB', id_gare_arrivee: 'DEMHB', id_operateur: 'OP-DB' },
  { id_trajet: 'OR-2024-0006', id_service: 'SVC-AVE-3014',id_trajet_source: 'RENFE-3014',heure_depart: '08:00:00', heure_arrivee: '10:30:00', duree_minutes: 150, id_ligne: 'L-ES-ES-01', emission_co2_kg: 9.80,  id_gare_depart: 'ESMAT', id_gare_arrivee: 'ESBSA', id_operateur: 'OP-RENFE' },
  { id_trajet: 'OR-2024-0007', id_service: 'SVC-NJ-401',  id_trajet_source: 'OBB-401', heure_depart: '21:47:00', heure_arrivee: '08:55:00', duree_minutes: 668, id_ligne: 'L-DE-CH-01', emission_co2_kg: 16.20, id_gare_depart: 'DEHHA', id_gare_arrivee: 'CHZUR', id_operateur: 'OP-OBB' },
  { id_trajet: 'OR-2024-0008', id_service: 'SVC-FR-9530', id_trajet_source: 'TI-9530', heure_depart: '14:20:00', heure_arrivee: '15:30:00', duree_minutes: 70,  id_ligne: 'L-IT-IT-01', emission_co2_kg: 4.10,  id_gare_depart: 'ITRTE', id_gare_arrivee: 'ITNAC', id_operateur: 'OP-TI' },
  { id_trajet: 'OR-2024-0009', id_service: 'SVC-TGV-2447',id_trajet_source: 'SNCF-2447',heure_depart: '11:11:00', heure_arrivee: '12:57:00', duree_minutes: 106, id_ligne: 'L-FR-DE-01', emission_co2_kg: 6.50,  id_gare_depart: 'FRPSL', id_gare_arrivee: 'DESHB', id_operateur: 'OP-SNCF' },
  { id_trajet: 'OR-2024-0010', id_service: 'SVC-TH-9329', id_trajet_source: 'THA-9329',heure_depart: '06:17:00', heure_arrivee: '09:36:00', duree_minutes: 199, id_ligne: 'L-NL-FR-01', emission_co2_kg: 8.90,  id_gare_depart: 'NLAMS', id_gare_arrivee: 'FRPNO', id_operateur: 'OP-THA' },
  { id_trajet: 'OR-2024-0011', id_service: 'SVC-NJ-295',  id_trajet_source: 'OBB-295', heure_depart: '20:32:00', heure_arrivee: '09:12:00', duree_minutes: 760, id_ligne: 'L-DE-IT-01', emission_co2_kg: 11.00, id_gare_depart: 'DEMHB', id_gare_arrivee: 'ITVSL', id_operateur: 'OP-OBB' },
  { id_trajet: 'OR-2024-0012', id_service: 'SVC-TGV-6601',id_trajet_source: 'SNCF-6601',heure_depart: '08:54:00', heure_arrivee: '10:51:00', duree_minutes: 117, id_ligne: 'L-FR-FR-01', emission_co2_kg: 7.60,  id_gare_depart: 'FRLYP', id_gare_arrivee: 'FRPLY', id_operateur: 'OP-SNCF' },
  { id_trajet: 'OR-2024-0013', id_service: 'SVC-ICE-12',  id_trajet_source: 'DB-12',   heure_depart: '13:43:00', heure_arrivee: '15:30:00', duree_minutes: 107, id_ligne: 'L-DE-BE-01', emission_co2_kg: 3.80,  id_gare_depart: 'DECHB', id_gare_arrivee: 'BEBMI', id_operateur: 'OP-DB' },
  { id_trajet: 'OR-2024-0014', id_service: 'SVC-FR-9617', id_trajet_source: 'TI-9617', heure_depart: '17:25:00', heure_arrivee: '19:10:00', duree_minutes: 105, id_ligne: 'L-IT-IT-01', emission_co2_kg: 5.30,  id_gare_depart: 'ITFLO', id_gare_arrivee: 'ITMIC', id_operateur: 'OP-TI' },
  { id_trajet: 'OR-2024-0015', id_service: 'SVC-TGV-8501',id_trajet_source: 'SNCF-8501',heure_depart: '07:20:00', heure_arrivee: '09:24:00', duree_minutes: 124, id_ligne: 'L-FR-FR-01', emission_co2_kg: 9.60,  id_gare_depart: 'FRPMP', id_gare_arrivee: 'FRBSJ', id_operateur: 'OP-SNCF' },
  { id_trajet: 'OR-2024-0016', id_service: 'SVC-NJ-457',  id_trajet_source: 'OBB-457', heure_depart: '20:02:00', heure_arrivee: '07:30:00', duree_minutes: 688, id_ligne: 'L-AT-FR-01', emission_co2_kg: 12.10, id_gare_depart: 'DEBHB', id_gare_arrivee: 'ATVHB', id_operateur: 'OP-OBB' },
  { id_trajet: 'OR-2024-0017', id_service: 'SVC-TH-313',  id_trajet_source: 'THA-313', heure_depart: '21:34:00', heure_arrivee: '07:56:00', duree_minutes: 622, id_ligne: 'L-FR-ES-01', emission_co2_kg: 10.50, id_gare_depart: 'ESMAT', id_gare_arrivee: 'ESMCH', id_operateur: 'OP-RENFE' },
  { id_trajet: 'OR-2024-0018', id_service: 'SVC-TGV-6181',id_trajet_source: 'SNCF-6181',heure_depart: '14:07:00', heure_arrivee: '17:15:00', duree_minutes: 188, id_ligne: 'L-FR-FR-01', emission_co2_kg: 12.40, id_gare_depart: 'FRMSC', id_gare_arrivee: 'FRPLY', id_operateur: 'OP-SNCF' },
  { id_trajet: 'OR-2024-0019', id_service: 'SVC-ICE-9555',id_trajet_source: 'DB-9555', heure_depart: '09:55:00', heure_arrivee: '13:36:00', duree_minutes: 221, id_ligne: 'L-FR-DE-01', emission_co2_kg: 8.00,  id_gare_depart: 'DEFFB', id_gare_arrivee: 'FRPES', id_operateur: 'OP-DB' },
  { id_trajet: 'OR-2024-0020', id_service: 'SVC-TGV-9573',id_trajet_source: 'SNCF-9573',heure_depart: '15:12:00', heure_arrivee: '18:24:00', duree_minutes: 192, id_ligne: 'L-FR-DE-01', emission_co2_kg: 10.00, id_gare_depart: 'DESHB', id_gare_arrivee: 'FRPES', id_operateur: 'OP-DB' },
];

const EXTRA_TRAJETS = [];
for (let i = 21; i <= 60; i++) {
  const base = TRAJETS[(i - 21) % TRAJETS.length];
  EXTRA_TRAJETS.push({
    ...base,
    id_trajet: `OR-2024-${String(i).padStart(4, '0')}`,
    id_service: base.id_service + '-b' + i,
    id_trajet_source: base.id_trajet_source + '-' + i,
  });
}
export const ALL_TRAJETS = [...TRAJETS, ...EXTRA_TRAJETS];

export const IMPORTS = [
  { id_import: 142, date_import: '2024-04-28T08:12:00Z', nb_lignes_importees: 12343, statut: 'succès',  message: 'Import quotidien GTFS — sources consolidées' },
  { id_import: 141, date_import: '2024-04-27T08:11:32Z', nb_lignes_importees: 0,     statut: 'échec',   message: 'Timeout sur feed Renfe (5000ms)' },
  { id_import: 140, date_import: '2024-04-26T08:10:11Z', nb_lignes_importees: 12087, statut: 'succès',  message: 'Import nominal' },
  { id_import: 139, date_import: '2024-04-25T08:09:54Z', nb_lignes_importees: 8204,  statut: 'partiel', message: 'Source DB indisponible — ignorée' },
  { id_import: 138, date_import: '2024-04-24T08:11:08Z', nb_lignes_importees: 12198, statut: 'succès',  message: 'Import nominal' },
  { id_import: 137, date_import: '2024-04-23T08:10:42Z', nb_lignes_importees: 12410, statut: 'succès',  message: 'Import nominal' },
  { id_import: 136, date_import: '2024-04-22T08:12:33Z', nb_lignes_importees: 11987, statut: 'succès',  message: 'Import nominal' },
  { id_import: 135, date_import: '2024-04-21T08:11:01Z', nb_lignes_importees: 0,     statut: 'échec',   message: 'Erreur de parsing GTFS — fichier malformé' },
  { id_import: 134, date_import: '2024-04-20T08:10:18Z', nb_lignes_importees: 12302, statut: 'succès',  message: 'Import nominal' },
  { id_import: 133, date_import: '2024-04-19T08:11:55Z', nb_lignes_importees: 12275, statut: 'succès',  message: 'Import nominal' },
  { id_import: 132, date_import: '2024-04-18T08:09:41Z', nb_lignes_importees: 12188, statut: 'succès',  message: 'Import nominal' },
  { id_import: 131, date_import: '2024-04-17T08:10:33Z', nb_lignes_importees: 9874,  statut: 'partiel', message: 'Source ÖBB partiellement disponible' },
];

export function operatorsWithVolumes() {
  return OPERATEURS.map(o => {
    const ts = ALL_TRAJETS.filter(t => t.id_operateur === o.id_operateur);
    const co2 = ts.reduce((s, t) => s + Number(t.emission_co2_kg), 0);
    return { ...o, nb_trajets: ts.length, co2_total_kg: Math.round(co2 * 100) / 100 };
  }).sort((a, b) => b.nb_trajets - a.nb_trajets);
}

export function topLiaisons(limit = 5) {
  const map = new Map();
  ALL_TRAJETS.forEach(t => {
    const k = t.id_gare_depart + '|' + t.id_gare_arrivee;
    if (!map.has(k)) map.set(k, { dep: t.id_gare_depart, arr: t.id_gare_arrivee, count: 0, durees: [], op: t.id_operateur, types: { jour: 0, nuit: 0 } });
    const e = map.get(k);
    e.count++;
    e.durees.push(t.duree_minutes);
    e.types[typeFromHeure(t.heure_depart)]++;
  });
  return [...map.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(e => ({
      depart: gareById(e.dep),
      arrivee: gareById(e.arr),
      operateur: operateurById(e.op).nom,
      trajets: e.count,
      duree_moyenne_minutes: Math.round(e.durees.reduce((s, v) => s + v, 0) / e.durees.length),
      type_dominant: e.types.nuit > e.types.jour ? 'nuit' : 'jour',
    }));
}

export function comparatifJourNuit() {
  const jour = ALL_TRAJETS.filter(t => typeFromHeure(t.heure_depart) === 'jour');
  const nuit = ALL_TRAJETS.filter(t => typeFromHeure(t.heure_depart) === 'nuit');
  const avg = arr => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
  return {
    jour: {
      nb: jour.length,
      duree_moy: Math.round(avg(jour.map(t => t.duree_minutes))),
      co2_moy: Math.round(avg(jour.map(t => Number(t.emission_co2_kg))) * 100) / 100,
      co2_total: Math.round(jour.reduce((s, t) => s + Number(t.emission_co2_kg), 0) * 100) / 100,
    },
    nuit: {
      nb: nuit.length,
      duree_moy: Math.round(avg(nuit.map(t => t.duree_minutes))),
      co2_moy: Math.round(avg(nuit.map(t => Number(t.emission_co2_kg))) * 100) / 100,
      co2_total: Math.round(nuit.reduce((s, t) => s + Number(t.emission_co2_kg), 0) * 100) / 100,
    }
  };
}

export function lignesWithStats() {
  return LIGNES.map(l => {
    const ts = ALL_TRAJETS.filter(t => t.id_ligne === l.id_ligne);
    return {
      ...l,
      nb_trajets: ts.length,
      co2_moyen_kg: ts.length ? Math.round(ts.reduce((s, t) => s + Number(t.emission_co2_kg), 0) / ts.length * 100) / 100 : 0,
    };
  }).sort((a, b) => b.nb_trajets - a.nb_trajets);
}

export function paysWithStats() {
  return PAYS.map(p => {
    const gares = GARES.filter(g => g.code_pays === p.code_pays);
    const departs = ALL_TRAJETS.filter(t => gares.some(g => g.id_gare === t.id_gare_depart));
    return {
      ...p,
      nb_gares: gares.length,
      nb_trajets_depart: departs.length,
    };
  }).filter(p => p.nb_gares > 0).sort((a, b) => b.nb_trajets_depart - a.nb_trajets_depart);
}

export function formatDuree(min) {
  const h = Math.floor(min / 60); const m = min % 60;
  return `${h}h${String(m).padStart(2, '0')}`;
}
export function formatHeure(t) { return t.slice(0, 5).replace(':', 'h'); }

export const API_EXAMPLES = {
  trajetsList: {
    page: 1, limit: 15, total: 60, total_pages: 4,
    results: [
      {
        id_trajet: 'OR-2024-0001',
        id_service: 'SVC-FR-9241',
        depart:  { id_gare: 'FRPLY', nom: 'Paris-Gare de Lyon', ville: 'Paris', code_pays: 'FR' },
        arrivee: { id_gare: 'ITMIC', nom: 'Milan Centrale',     ville: 'Milan', code_pays: 'IT' },
        heure_depart: '09:35:00', heure_arrivee: '16:47:00', duree_minutes: 432,
        type_calcul: 'jour', emission_co2_kg: 14.50,
        ligne: { id_ligne: 'L-FR-IT-01', nom_ligne: 'Paris ↔ Milan' },
        operateur: { id_operateur: 'OP-TI', nom: 'Trenitalia' }
      }
    ]
  },
  trajetDetail: {
    id_trajet: 'OR-2024-0001',
    id_service: 'SVC-FR-9241',
    id_trajet_source: 'TI-9241',
    depart: { id_gare: 'FRPLY', nom_officiel: 'Paris-Gare de Lyon', ville: 'Paris', code_pays: 'FR', pays: 'France', type_liaison: 'internationale', latitude: 48.844444, longitude: 2.373611 },
    arrivee:{ id_gare: 'ITMIC', nom_officiel: 'Milan Centrale',     ville: 'Milan', code_pays: 'IT', pays: 'Italie', type_liaison: 'internationale', latitude: 45.486389, longitude: 9.205000 },
    heure_depart: '09:35:00', heure_arrivee: '16:47:00', duree_minutes: 432,
    type_calcul: 'jour', emission_co2_kg: 14.50,
    ligne: { id_ligne: 'L-FR-IT-01', nom_ligne: 'Paris ↔ Milan' },
    operateur: { id_operateur: 'OP-TI', nom: 'Trenitalia' }
  },
  kpi: { total_trajets: 60, trajets_jour: 41, trajets_nuit: 19, total_operateurs: 6, total_lignes: 13, total_gares: 27, total_pays: 8, co2_total_kg: 612.40, co2_moyen_kg: 10.21, duree_moyenne_minutes: 305 },
  volumesOperateur: { groupby: 'operateur', total: 60, repartition: [{ id_operateur: 'OP-SNCF', nom: 'SNCF', trajets: 14, co2_total_kg: 130.50, part: 0.233 }] },
  comparatif: { indicateurs: [{ label: 'Nombre de trajets', jour: 41, nuit: 19, unite: '' }, { label: 'Durée moyenne', jour: 158, nuit: 712, unite: 'min' }, { label: 'CO₂ moyen', jour: 8.40, nuit: 16.80, unite: 'kg' }] },
  topLiaisons: { results: [{ depart: { id_gare: 'FRPNO', nom: 'Paris-Nord', ville: 'Paris', code_pays: 'FR' }, arrivee: { id_gare: 'BEBMI', nom: 'Bruxelles-Midi', ville: 'Bruxelles', code_pays: 'BE' }, operateur: 'Thalys', trajets: 8, duree_moyenne_minutes: 82, type_dominant: 'jour' }] },
  imports: { page: 1, limit: 20, total: 142, imports: IMPORTS.slice(0, 5) },
  importsStats: { total_imports: 142, imports_reussis: 138, imports_echoues: 3, imports_partiels: 1, taux_reussite: 0.972, dernier_import: { date_import: '2024-04-28T08:12:00Z', statut: 'succès', nb_lignes_importees: 12343 }, lignes_importees_total: 1247892 },
  health: { status: 'ok', timestamp: '2024-04-28T14:32:11Z', version: '1.0.0', components: { db: 'ok' } },
  operateurs: { operateurs: OPERATEURS.map(o => ({ id_operateur: o.id_operateur, nom: o.nom, nb_trajets: 10, nb_lignes: 3 })) },
  lignes: { lignes: LIGNES.slice(0, 3).map(l => ({ id_ligne: l.id_ligne, nom_ligne: l.nom_ligne, nb_trajets: 6, co2_moyen_kg: 12.40, duree_moyenne_minutes: 280 })) },
  gares: { gares: GARES.slice(0, 3) },
  pays: { pays: PAYS.slice(0, 3).map(p => ({ ...p, nb_gares: 5, nb_trajets_depart: 24 })) },
};
