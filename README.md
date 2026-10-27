# Michel Juffard — Systèmes, réseaux & cybersécurité

Portfolio professionnel en français : Michel Juffard, étudiant à 42 Lyon et tuteur, en recherche d’une alternance en systèmes, réseaux ou cybersécurité. Le site statique est construit avec Astro, TypeScript, Markdown et CSS natif. Il est publié en HTTPS sur [mjuffard.fr](https://mjuffard.fr) et hébergé actuellement chez OVHcloud. Les faits de référence se trouvent dans `PROJECT.md`.

## Contact public

- GitHub : [MichJuffard](https://github.com/MichJuffard)
- E-mail : [juffard.michel@gmail.com](mailto:juffard.michel@gmail.com)
- LinkedIn : [Michel Juffard](https://www.linkedin.com/in/michel-juffard/)

## Développement

Prérequis : Node.js ≥ 22.12.0 et npm ≥ 9.6.5, compatibles avec Astro 7.3.8 installé ici. Les versions effectivement installées sont verrouillées dans `package-lock.json`. Les scripts désactivent la télémétrie Astro et sont adaptés au terminal macOS/Linux.

```sh
npm ci
npm run dev
```

Ouvrir l’adresse affichée par Astro, généralement `http://localhost:4321`.

En développement, Vite relaie `/data/homelab-inventory.json` et `/data/homelab-metrics.json` vers `https://mjuffard.fr`. Les composants gardent leurs URL relatives, identiques en développement et en production. Ces JSON sont produits sur le homelab et transférés directement par SFTP vers OVHcloud ; ils ne sont ni versionnés dans Git ni inclus dans `public/` ou `dist/`.

```sh
npm run check
npm run build
npm run preview
node --experimental-strip-types --test scripts/*.test.mjs
```

`check` vérifie les types et les composants. `build` effectue cette vérification puis génère le site statique dans `dist/`. `preview` permet de consulter ce résultat localement. Aucune connexion au homelab n’est nécessaire.

## Comprendre la structure

- `src/pages/` : les fichiers définissent les URL ; `projets/[slug].astro` génère une page par projet à la compilation.
- `src/layouts/BaseLayout.astro` : structure HTML commune, navigation et pied de page.
- `src/components/ProjectCard.astro` : carte réutilisée sur l’accueil et la liste des projets.
- `src/components/PortfolioLifecycle.astro` : parcours interactif des responsabilités, contrôles et étapes d’exploitation du site.
- `src/content/projects/` : fiches Markdown et métadonnées.
- `src/content.config.ts` : validation des données des fiches.
- `src/data/site.ts` : identité, descriptions, URL publique utilisée pour les métadonnées canonical et Open Graph, et navigation principale (Accueil, Projets, À propos, Contact).
- `src/styles/global.css` : palette, typographie et règles responsive, sans framework CSS ni police externe.

## Ajouter une fiche

Créer un fichier Markdown dans `src/content/projects/` avec les champs `title`, `summary`, `status` (`terminé`, `en cours` ou `prévu`), `tags` (liste), `category` (`École 42`, `Personnel` ou `Professionnel`), `featured` (booléen), `featuredOrder` (position optionnelle sur l’accueil) et `order` (nombre). Choisir `order` selon la pertinence du projet pour l’administration systèmes et réseaux : infrastructure/virtualisation, réseaux/sécurité, supervision/observabilité, automatisation/CI/CD/exploitation, puis développement et outils. Ne pas utiliser une date ni l’ordre alphabétique comme règle implicite. `featuredOrder` est indépendant et règle uniquement l’accueil.

Les champs optionnels `objective`, `contribution` et `learnings` alimentent le résumé en tête de fiche ; ne les renseigner qu’avec des faits établis et omettre une contribution lorsqu’elle n’est pas documentée. Les technologies affichées dans ce résumé proviennent des `tags`. La catégorie détermine les filtres affichés sur la page Projets ; une fiche ne figure qu’une fois dans la liste. Chaque projet doit avoir un visuel interactif adapté au sujet, avec une alternative compréhensible, accès clavier et respect de `prefers-reduced-motion`. Le nom du fichier détermine son URL. Rédiger le contenu à partir de faits vérifiés et lancer `npm run build`.

Les fiches détaillées commencent par une synthèse de l’objectif, de la contribution connue, des apprentissages et des technologies ; les pages longues proposent un sommaire interne. Les démonstrations pédagogiques et textes techniques existants restent en place. Snowcrash, Rainfall et Override sont regroupés dans une fiche CTF. Les contributions documentées concernent Minishell et Transcendance ; ft_ping reste en cours. Le homelab est une fiche personnelle majeure à `/projets/homelab/` ; les anciennes URL `/homelab/`, `/projets/proxmox/`, `/projets/debian-ssh/` et `/projets/diagnostic-reseau/` redirigent vers cette fiche. Elle documente maintenant le VPN WireGuard opérationnel et testé depuis un réseau mobile, ainsi que les évolutions encore à réaliser. Le problème initial de liaison du répéteur Wi-Fi avec la Freebox a été résolu via Freebox Connect.

## Hébergement et chaîne CI/CD

Le site statique est actuellement hébergé chez **OVHcloud** et publié en HTTPS sur **mjuffard.fr**. Il est versionné sur GitHub. Les workflows GitHub Actions exécutent l’analyse des secrets avec Gitleaks, les tests et contrôles du projet, puis le build Astro. Un artefact transmet les fichiers construits au job de déploiement.

Le déploiement SFTP vers OVHcloud utilise le script Python `scripts/deploy_sftp.py` et Paramiko. L’empreinte SSH du serveur est vérifiée avant l’authentification ; les secrets et variables de déploiement sont fournis par GitHub Actions. Un premier déploiement manuel via `workflow_dispatch` a réussi. Le déploiement n’est pas déclenché automatiquement à chaque push.

La fiche [Portfolio et chaîne CI/CD](/projets/portfolio-cicd/) décrit le besoin, les choix techniques, l’implémentation, la validation et les évolutions prévues.

**État opérationnel :** l’hébergement OVHcloud, HTTPS, les contrôles CI, le build Astro et le transfert SFTP manuel sont validés.

**Évolutions à réaliser :** automatiser le déploiement après validation de la CI, supprimer les anciens fichiers distants de façon maîtrisée, mettre en place un déploiement atomique et un retour arrière, et migrer l’hébergement vers le homelab Proxmox. La migration est un objectif à court terme, pas une réalisation actuelle.

Le dossier `dist/` contient le site compilé ; Node.js n’est pas nécessaire sur le serveur pour servir ce résultat statique.

## Visuel interactif du projet Portfolio

La fiche `/projets/portfolio-cicd/` utilise `src/components/PortfolioLifecycle.astro` pour parcourir huit étapes : besoins, conception, développement avec Codex, gestion du code, CI, déploiement, production, puis supervision et maintenance. Chaque étape est un élément HTML `<details>` : le parcours reste utilisable au clavier et son contenu demeure accessible sans JavaScript. Les outils et contrôles décrits reprennent les workflows présents dans le dépôt. L’absence actuelle d’un contrôle de disponibilité du site est signalée explicitement.

## Visuel miniRT

La fiche `/projets/minirt/` intègre `src/components/MiniRTDemo.astro` : une illustration interactive indépendante du moteur C. `src/lib/minirt-demo.ts` reprend la géométrie de `scene/bonus/trophy.rt` trouvée dans `origin/update-readme` : paraboloïde tronqué, cylindres fermés orientés, ellipsoïde et sphère. Le cadrage, le sol et les lumières colorées sont adaptés au portfolio. Une source blanche frontale fait ressortir les reflets spéculaires sur la coupe ; la lumière diffuse est atténuée pour éviter de masquer ces reflets par la saturation des couleurs. La scène est recalculée uniquement à l’activation et lors des réglages, sans boucle d’animation permanente. `src/lib/minirt.worker.ts` effectue le calcul hors du fil principal. Le curseur utilise un aperçu 320 × 180 puis un rendu 640 × 360 au relâchement ; les demandes intermédiaires sont regroupées pour garder seulement la plus récente.

L’aperçu PNG (`src/assets/minirt-preview.png`) est partagé entre la fiche et la carte projet ; il reste visible sans JavaScript. Il est régénéré avant `npm run dev` et `npm run build`. Son import Astro produit une URL liée au contenu : un changement de rendu renouvelle l’URL pour éviter de conserver un ancien aperçu dans le cache du navigateur. Aucun accès au dépôt miniRT n’est nécessaire pour construire ou consulter le portfolio. La fiche décrit le code lu, sans attribuer de contribution individuelle ni publier les sources ou textures du dépôt.

```sh
# Régénérer l’aperçu après modification de la scène (Node.js 22.20+)
node --experimental-strip-types scripts/minirt-preview.mjs
# Vérifier les effets des réglages sur l’image
node --experimental-strip-types --test scripts/minirt-demo.test.mjs
```

## Visuel Webserv

La fiche `/projets/webserv/` utilise `src/components/WebservDemo.astro` et les parcours pédagogiques de `src/data/webserv.ts`. Quatre exemples illustrent GET 200, GET 404, PUT 405 et GET vers un CGI Python. Le visiteur progresse manuellement dans les étapes ; aucun appel réseau, upload, suppression ou processus C++ n’est déclenché. Les exemples HTTP affichés sont volontairement simplifiés.

Le schéma SVG `src/assets/webserv-flow.svg` est partagé avec les cartes de l’accueil et de la liste des projets. Il reste visible sans JavaScript et reçoit une URL liée à son contenu via l’import Astro. Le dépôt original utilise `epoll` sous Linux ; il a été lu sans être modifié ni exécuté pour cette présentation. Les contributions individuelles et performances ne sont pas établies.

## Visuel Transcendance

`src/components/TranscendanceDemo.astro` présente trois captures originales du dépôt fourni : partie, options de jeu et supervision. Les PNG de référence sont conservés dans `src/assets/transcendance/`. Astro génère des WebP redimensionnés pour la galerie et les cartes ; les captures originales restent accessibles par les liens d’agrandissement.

La galerie et l’explorateur des services (`src/data/transcendance.ts`) fonctionnent sans démarrer la plateforme ni appeler ses API. Sans JavaScript, la première capture et la description initiale restent visibles. Les autres services sont résumés dans le contenu Markdown. La fiche distingue le projet collectif des contributions confirmées : authentification, backend des tournois et DevOps/monitoring. Le dépôt source a seulement été consulté.

### Pong jouable

`src/components/PongDemo.astro` ajoute un canvas local avec la géométrie Hexagone et les raquettes classiques relevées dans `services/game/app/usecases/createGame.ts`. `src/lib/pong-demo.ts` contient un moteur indépendant : collisions cercle/segments avec sous-pas, adversaire automatique, score en cinq points et vitesse plafonnée. Aucun backend ni WebSocket n’est démarré.

Le jeu se lance explicitement. Il accepte flèches, Z/S, souris, glissement tactile et boutons directionnels. Espace met en pause/reprend ; Échap met en pause. La sortie de la zone de jeu, la perte de focus de la fenêtre et le masquage de l’onglet mettent aussi en pause pour arrêter la boucle de rendu.

```sh
node --experimental-strip-types --test scripts/pong-demo.test.mjs
```

## Visuel ft_ping

La fiche `/projets/ft-ping/` est marquée « en cours », conformément à l’état communiqué par le propriétaire. Le dépôt contient les composants de résolution, socket raw, encodage/décodage, checksum et suivi temporel ; la boucle active n’intègre pas encore le cycle complet d’envoi/réception. Le dépôt n’a pas été modifié ni exécuté.

`src/components/PingDemo.astro` présente un échange ICMP fictif en trois étapes, avec réponse ou expiration, et un inspecteur des champs d’en-tête. Le RTT de 24 ms et l’identifiant affichés sont des exemples pédagogiques ; aucun paquet réseau n’est envoyé. `src/assets/ping-flow.svg` est partagé avec la carte projet et reste visible sans JavaScript.

## Visuel Inception

`src/components/InceptionDemo.astro` propose une carte des huit services configurés : Nginx, WordPress, MariaDB, Redis, site statique, Adminer, Portainer et FTP. Les données de `src/data/inception.ts` détaillent leurs rôles, chemins d’accès, volumes et dépendances de démarrage. Le schéma SVG `src/assets/inception-stack.svg` sert d’aperçu à la carte projet.

La fiche repose sur les Dockerfiles, scripts d’entrée, configuration Nginx et fichier Compose du dépôt local fourni. Aucun fichier `.env`, certificat, clé ou secret n’a été lu ou copié. Aucun conteneur n’a été lancé ni état de santé mesuré. Le schéma et la description initiale restent visibles sans JavaScript.

## Explorateur Minishell

`src/components/MinishellDemo.astro` affiche un arbre SVG généré depuis la saisie et permet de parcourir la trace, de revenir en arrière et d’afficher le résultat. Le nœud courant, les statuts retournés et les sous-arbres ignorés sont indiqués. Le SVG `src/assets/minishell-tree.svg` sert d’aperçu sur les cartes et de repli sans JavaScript.

`src/lib/minishell-demo.ts` est un interpréteur pédagogique indépendant : `&&` et `||` associatifs à gauche, pipelines, parenthèses, redirections `<`, `>` et `>>`, guillemets, variables `$HOME`, `$USER`, `$PWD` et `$?`. Il simule echo, return, true, false, pwd, cd, ls, cat, grep littéral, wc et tr pour la casse. Il ne lance ni processus, ni appel réseau, ni accès au système de fichiers de l’hôte. Les fichiers virtuels et le répertoire courant sont réinitialisés à chaque saisie exécutée. Les pipes sont illustrés séquentiellement avec des contextes distincts, et les groupes entre parenthèses isolent le répertoire courant. Les heredocs, substitutions de commandes et tâches d’arrière-plan sont refusés ; la démo ne reproduit pas les expansions complètes d’un shell (glob, word splitting, etc.).

Les entrées sont limitées à 512 caractères et les arbres à 31 nœuds ; les libellés et sorties sont insérés comme texte. Les tests couvrent les décisions de court-circuit, les pipes, les redirections, les guillemets, les erreurs et l’isolation des contextes.

La fiche attribue au propriétaire le moteur d’exécution et le parcours de l’arbre, et à son binôme le parsing et la construction de l’arbre. Le choix de l’arbre pour traiter plus facilement `&&` et `||` est confirmé par le propriétaire. Le dépôt C a été consulté sans modification ni exécution.

```sh
node --experimental-strip-types --test scripts/minishell-demo.test.mjs
```

## Régression linéaire interactive

`src/data/linear-regression.csv` reprend les 24 observations du dépôt fourni. `src/lib/linear-regression.ts` réimplémente la méthode Python : min-max sur le kilométrage uniquement, paramètres initialisés à zéro, gradients moyens et arrêt sur variation de MSE (10⁻⁶). Le script Python propose 10 000 mises à jour au taux 0,01. La démo web propose par défaut un budget de 300 000, avec arrêt anticipé au seuil ; les paramètres par défaut de la fonction `train` conservent le budget Python de 10 000.

`src/components/LinearRegressionDemo.astro` propose un SVG interactif : curseur des itérations, taux 0,001/0,01/0,1, budgets 10 000/50 000/100 000/300 000, résidus, prédiction selon le kilométrage et métriques RMSE/R². Les contrôles restent manuels, sans animation continue. Les métriques utilisent les données d’apprentissage ; les extrapolations sont signalées. Sans JavaScript, le graphique appris, les métriques et le tableau de données restent accessibles.

Le générateur `scripts/linear-regression-preview.mjs` produit `src/assets/linear-regression.svg` pour les cartes. `scripts/generate-previews.mjs` régénère les aperçus miniRT et régression avant le développement et le build. Aucun package Python n’est installé et le dépôt source n’a pas été modifié.

```sh
node --experimental-strip-types --test scripts/linear-regression.test.mjs
```

La régression distingue explicitement l’arrêt par seuil de l’épuisement du budget, avec `TrainingHistory.stopReason`. Un tableau comparatif calculé au build montre le RMSE à 10 000 itérations (ou à l’arrêt si antérieur), le nombre de pas avant arrêt et le RMSE final sur un budget maximal de 300 000. Le texte explique qu’un taux plus faible n’implique pas une meilleure précision finale.

## Parcours CTF regroupé

`src/content/projects/ctf.md` réunit Snowcrash, Rainfall et Override autour de la découverte de la sécurité offensive et de la compréhension de la mémoire. Les trois anciennes fiches sont remplacées par une carte commune ; `astro.config.mjs` conserve leurs adresses via des redirections statiques vers `/projets/ctf/` avec un fragment sélectionnant la série.

`src/components/CTFDemo.astro` et `src/data/ctf.ts` présentent les notions relevées dans les ressources du dépôt fourni. Le modèle mémoire compte 16 octets illustratifs : buffer de 8 octets puis deux champs de 4 octets. Le visiteur fait varier la taille de la copie et active une borne de capacité. Cette disposition ne reproduit pas un binaire précis, l’agencement du tas ou un terminateur de chaîne C. Les états sont distingués par la couleur et par des libellés accessibles. Le schéma `src/assets/ctf-memory.svg` sert d’aperçu à la carte.

Aucun payload, programme de challenge ou commande d’exploitation n’est intégré au site. Le dépôt source n’a pas été modifié ni exécuté.

## Accueil orienté administration système

La sélection fixe de l’accueil comprend Inception, Transcendance sous l’angle DevOps/monitoring, puis le homelab personnel. Le champ `featured` sélectionne les cartes ; `featuredOrder` détermine leur ordre. Les champs optionnels `featuredTitle`, `featuredSummary` et `featuredTags` adaptent la présentation à l’accueil, tandis que la liste complète conserve les titres, descriptions et tags généraux des fiches.

La carte Transcendance utilise la capture Grafana sur l’accueil et le jeu dans la liste complète. Le schéma `src/assets/homelab-stack.svg` illustre l’inventaire public d’environnements VM et LXC hébergés par Proxmox, sans détailler le réseau. La fiche homelab distingue le VPN réalisé des prochaines étapes.

Philosophers (concurrence, threads, mutex, synchronisation) et Push_swap (algorithmique, complexité, optimisation des opérations) sont mentionnés dans les compétences sans fiches ni cartes supplémentaires, selon le choix du propriétaire. Leurs dépôts n’ont pas été examinés.

## Widget de monitoring du homelab

La fiche `/projets/homelab/` affiche les mesures courantes du nœud Proxmox depuis `/data/homelab-metrics.json`. Un LXC Alpine dédié interroge l’API Proxmox en HTTPS avec validation TLS et un jeton limité à `Sys.Audit` ; `curl` et `jq` extraient CPU, mémoire et stockage `rootfs`. Une tâche cron collecte et publie le JSON minimal toutes les trois minutes par SFTP vers OVHcloud. Le navigateur désactive le cache, valide les quatre champs et marque la mesure périmée à partir de 15 minutes après son horodatage de collecte. En cas de données absentes ou invalides, aucune valeur de secours n’est affichée. Le build statique ne dépend pas de l’endpoint.

Le format public, les règles de validation, la péremption et le périmètre limité du widget sont documentés dans [`docs/homelab-monitoring.md`](docs/homelab-monitoring.md). Le fichier public contient `collected_at`, `cpu_percent`, `memory_percent` et `storage_percent` ; le stockage concerne uniquement `rootfs`. Ce monitoring n’inclut pas Prometheus, Grafana, d’historique ni d’alertes et ne constitue pas une observabilité complète. Pour désactiver le widget, passer `monitoringEnabled` à `false` dans la fiche homelab ; `monitoringFallback` conserve une description exacte du système.

## Architecture publique dynamique du homelab

La fiche `/projets/homelab/` lit l’inventaire statique [`/data/homelab-inventory.json`](https://mjuffard.fr/data/homelab-inventory.json). Le collecteur privé sélectionne les VM et LXC portant le tag Proxmox `portfolio-public`. Le principe est privé par défaut : une nouvelle machine n’est publiée qu’après décision explicite et ajout de ce tag côté Proxmox. La sélection et le filtrage restent côté collecteur ; le navigateur ne contacte jamais Proxmox et ne reçoit aucun identifiant interne ou détail réseau.

Le format public contient uniquement :

```ts
interface HomelabInventory {
  collected_at: string; // date UTC de collecte
  services: Array<{
    name: string; // libellé public
    type: 'vm' | 'lxc';
    status: 'running' | 'stopped' | 'unknown';
  }>;
}
```

Le fichier est publié et relu par le navigateur toutes les trois minutes. Le chargement désactive le cache. À partir de quinze minutes après `collected_at`, la vue signale que les données sont anciennes et les états deviennent « non vérifiés » ; un horodatage futur ou un endpoint indisponible ne produit pas un état actuel. Une liste valide vide est affichée comme vide. Les cartes sont générées depuis le tableau : tout service VM ou LXC ajouté à l’inventaire apparaît automatiquement, avec une description générique tant qu’aucune explication locale n’est renseignée.

« Actif » signifie uniquement que Proxmox a rapporté `running` lors de la collecte. Cela ne confirme ni la disponibilité de l’application ni, pour le conteneur WireGuard, le fonctionnement du tunnel VPN de bout en bout. Une VM arrêtée à la demande est présentée comme « Arrêté », sans être décrite comme en panne.

La vue publique reste une présentation pédagogique des environnements explicitement autorisés et de leur relation logique d’hébergement. Le widget CPU, mémoire et `rootfs` reste une supervision publique simplifiée. Prometheus/Grafana et une supervision plus détaillée sont des pistes futures pour un tableau de bord privé ; elles ne sont pas présentées comme opérationnelles. Le site lui-même est toujours hébergé chez OVHcloud : sa migration vers le homelab est un projet ultérieur.

Les règles de validation et de rendu sont détaillées dans [`docs/homelab-inventory.md`](docs/homelab-inventory.md). Les tests dédiés se lancent avec :

```sh
node --experimental-strip-types --test scripts/homelab-inventory.test.mjs
```

Les cas de validation, de mesure manquante, de valeur invalide et de fraîcheur sont vérifiés par :

```sh
node --experimental-strip-types --test scripts/homelab-monitoring.test.mjs
```

## Utilisation de l'IA et contributions personnelles

Le site est développé avec l’assistance de **Codex (OpenAI)**. Codex contribue à la production et à l’évolution du code, des interfaces et des fonctionnalités. Je pilote le projet : besoins, objectifs, choix techniques et architecture, validation des changements, infrastructure, hébergement, CI/CD, déploiement, supervision, sécurité, maintenance et évolution.

Cette démarche me permet d'expérimenter le développement assisté par IA tout en travaillant sur la conception, l'analyse du code et l'intégration des fonctionnalités.

### Mes responsabilités

- **Les projets présentés** : les projets techniques décrits dans ce portfolio correspondent à mon parcours, à mes réalisations et à mes apprentissages.
- **L'infrastructure homelab** : installation, configuration, administration et expérimentation sur mon infrastructure personnelle.
- **La conduite du projet** : définition des besoins, orientation fonctionnelle, décisions d’architecture et validation des solutions.
- **L’infrastructure et la production** : hébergement OVHcloud, domaine, mise en production et validation du résultat publié.
- **Le CI/CD et l’exploitation** : responsabilité des workflows et du processus de déploiement, supervision, sécurité et maintenance opérationnelle.

### Mon approche

Je considère l'IA comme un outil d'assistance au développement, et non comme un substitut à la compréhension technique.

La disponibilité du site n’a pas encore de contrôle dédié. Le suivi CPU/mémoire/stockage du homelab ne doit pas être présenté comme une supervision de la disponibilité du portfolio.
