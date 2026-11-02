# Portfolio de Michel Juffard

Portfolio professionnel en français consacré à mes projets en systèmes, réseaux, cybersécurité et DevOps, dans le cadre de mon parcours informatique à 42 Lyon. Il présente les compétences que je développe au travers de projets d’école et de mon homelab.

Le site statique est publié sur [mjuffard.fr](https://mjuffard.fr) et hébergé chez **OVHcloud**. La migration vers mon homelab est prévue, mais n’a pas encore été réalisée.

[GitHub](https://github.com/MichJuffard) · [LinkedIn](https://www.linkedin.com/in/michel-juffard/) · [Me contacter](mailto:juffard.michel@gmail.com)

## Technologies et organisation

Le site utilise **Astro**, **TypeScript**, **Markdown** et du **CSS natif**. Il ne comporte pas de backend. Les fiches projet et leurs métadonnées sont dans `src/content/projects/` ; `src/pages/` définit les pages, `src/components/` les éléments réutilisables et `src/lib/` la logique des démonstrations interactives.

L’accueil met en avant trois projets : le **homelab** (administration et observabilité), **Inception** (infrastructure conteneurisée) et **Transcendance** (DevOps et supervision). La page [Projets](https://mjuffard.fr/projets/) donne accès à l’ensemble des fiches.

## Développement local

Prérequis : Node.js ≥ 22.12 et npm ≥ 9.6.5.

```sh
npm ci
npm run dev
```

Astro affiche l’adresse locale à ouvrir, généralement `http://localhost:4321`. Pour vérifier le projet et lancer les tests :

```sh
npm run check
node --experimental-strip-types --test scripts/*.test.mjs
npm run build
npm run preview
```

Le build lance aussi la vérification Astro et génère le site dans `dist/`. Les tests sont locaux et ne nécessitent pas de service externe ni de secret.

## Contributions et responsabilités

Les changements se font sur une branche dédiée et sont proposés dans une Pull Request vers `main`. Avant de la proposer, lancer les tests concernés, `npm run check` et `npm run build`. Les commits suivent Conventional Commits ; les titres et descriptions de Pull Request sont en anglais. Les règles détaillées sont dans [AGENTS.md](AGENTS.md).

Je définis les besoins, la conception fonctionnelle, l’architecture et les choix techniques. J’administre les infrastructures et services associés, conçois et maintiens la CI/CD, pilote les déploiements et l’exploitation, puis relis et valide les Pull Requests.

**Codex (OpenAI) m’assiste dans le développement du site** : implémentation et modification du code, création et maintenance des tests, corrections et améliorations du code, et documentation. Le code est donc développé avec une assistance IA ; le pilotage technique, l’administration et l’exploitation restent sous ma responsabilité.

La CI GitHub Actions actuelle exécute l’analyse Gitleaks, les tests et le build ; le déploiement de production vers OVHcloud est déclenché manuellement. Je suis responsable de la conception, de la configuration et de la maintenance de ces workflows, ainsi que de toute décision ou évolution concernant les tests dans les pipelines. Codex ne les modifie que sur demande explicite.

## Documentation

Les détails fonctionnels sont présentés dans les [fiches projet](src/content/projects/), et les contrats de données publics du homelab dans [l’inventaire](docs/homelab-inventory.md) et [les métriques](docs/homelab-monitoring.md). La fiche [Portfolio et CI/CD](src/content/projects/portfolio-cicd.md) décrit le cycle de livraison et son état actuel.
