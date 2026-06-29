import { Icon, Badge } from '../components/Layout';

// E6.4 · Accessibilité & utilisabilité
// Les 6 familles de handicap (référentiel RGAA) et la réponse apportée par ObRail.
const FAMILLES = [
  {
    id: 'moteur',
    nom: 'Moteur',
    icon: 'panel',
    mesure: 'Clavier intégral, commande vocale (Voice Access, Google Assistant).',
    mise: 'Navigation 100 % au clavier, focus visible, zones cliquables larges.',
  },
  {
    id: 'visuel',
    nom: 'Visuel',
    icon: 'search',
    mesure: "Lecteur d'écran, contrastes, taille / densité réglables.",
    mise: 'Labels ARIA sur la navigation, thème jour/nuit et densité ajustables.',
  },
  {
    id: 'auditif',
    nom: 'Auditif',
    icon: 'pulse',
    mesure: 'Information portée par le texte et les visuels, sans dépendance au son.',
    mise: 'Aucun contenu uniquement sonore, statuts doublés par texte et couleur.',
  },
  {
    id: 'psychique',
    nom: 'Psychique',
    icon: 'clock',
    mesure: 'Interface sobre, messages clairs, sans contrainte de temps.',
    mise: 'Pas de minuteur bloquant, messages d’erreur explicites et rassurants.',
  },
  {
    id: 'mental',
    nom: 'Mental',
    icon: 'doc',
    mesure: 'Vocabulaire simple, parcours guidé du simulateur.',
    mise: 'Étapes courtes, libellés sans jargon, aide contextuelle.',
  },
  {
    id: 'cognitif',
    nom: 'Cognitif',
    icon: 'home',
    mesure: 'Mise en page aérée, hiérarchie visuelle constante.',
    mise: 'Grille régulière, titres hiérarchisés, repères de navigation stables.',
  },
];

export default function Accessibilite() {
  return (
    <div className="page">
      <section className="panel">
        <div className="doc-hero">
          <div>
            <div className="doc-kicker">E6.4 · Accessibilité &amp; utilisabilité</div>
            <h2 className="doc-title">Accessibilité : les 6 familles de handicap (RGAA)</h2>
            <p className="doc-intro">
              ObRail vise la conformité au <strong>RGAA</strong> (Référentiel général
              d&apos;amélioration de l&apos;accessibilité). Chaque famille de handicap est prise en
              compte par des mesures concrètes intégrées à l&apos;interface.
            </p>
          </div>
          <div className="doc-meta-stack">
            <div className="doc-meta-card">
              <div className="doc-meta-label">Référentiel</div>
              <code className="doc-meta-code" data-accent="true">
                RGAA 4.1
              </code>
            </div>
            <div className="doc-meta-card">
              <div className="doc-meta-label">Cible</div>
              <code className="doc-meta-code">WCAG 2.1 AA</code>
            </div>
          </div>
        </div>
      </section>

      <section className="grid-3" aria-label="Les 6 familles de handicap">
        {FAMILLES.map((f) => (
          <article key={f.id} className="a11y-card">
            <div className="a11y-card-head">
              <span className="a11y-icon" aria-hidden="true">
                <Icon name={f.icon} size={18} />
              </span>
              <h3 className="a11y-card-title">{f.nom}</h3>
            </div>
            <p className="a11y-card-mesure">{f.mesure}</p>
            <div className="a11y-card-mise">
              <Badge tone="success">ObRail</Badge>
              <span>{f.mise}</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
