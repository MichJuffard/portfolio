# Instructions pour Codex

## Git et commits

- Travailler sur une branche dédiée à chaque tâche et proposer les changements dans une Pull Request vers `main` lorsque cette livraison est demandée. Ne jamais fusionner sans validation explicite.
- Chaque tâche fonctionnelle terminée doit faire l'objet d'un commit Git.
- Les commits doivent être atomiques : un commit correspond à une modification logique et cohérente.
- Utiliser la convention Conventional Commits :
  - `feat:` nouvelle fonctionnalité
  - `fix:` correction de bug
  - `refactor:` modification interne sans changement fonctionnel
  - `style:` modifications de présentation
  - `docs:` documentation
  - `test:` tests
  - `ci:` intégration et déploiement continus
  - `chore:` maintenance
- Utiliser des messages de commit courts, descriptifs et en anglais.
- Rédiger en anglais les titres, descriptions et échanges associés aux Pull Requests.
- Avant chaque commit, vérifier les changements avec `git diff` et `git status`.
- Ne jamais inclure de secrets, d'informations sensibles ou de fichiers générés.
- Exécuter les tests pertinents et les vérifications nécessaires avant de committer.
- Ne committer que les fichiers concernés par la tâche.
- Ne jamais modifier, réécrire ou supprimer des commits existants sans autorisation.
- Ne jamais effectuer de `git push` sans demande explicite ; une demande de Pull Request autorise le push nécessaire à sa création.
- Ne pas inclure dans un commit des modifications préexistantes appartenant à l'utilisateur.
- Si la tâche nécessite plusieurs modifications indépendantes, créer plusieurs commits cohérents plutôt qu'un seul commit global.
- À la fin, fournir les identifiants et messages des commits créés.

## Méthode de travail

- Respecter l'architecture existante du portfolio Astro.
- Privilégier des changements ciblés et maintenables.
- Ne pas ajouter de dépendances sans nécessité.
- Préserver les fonctionnalités et démonstrations existantes.
- Documenter les décisions techniques importantes.
- Signaler clairement les tests qui n'ont pas pu être exécutés.

## Tests unitaires

- Codex accompagne toute nouvelle logique fonctionnelle testable de tests unitaires pertinents et adapte les tests existants lorsqu'un comportement change.
- Toute correction de bug est accompagnée, si pertinent, d'un test de non-régression.
- Les tests couvrent les comportements attendus, les cas limites et les erreurs significatives. Ils sont déterministes, reproductibles et indépendants des services externes ; ils ne nécessitent aucun secret.
- Privilégier les outils et conventions de test déjà présents dans le dépôt.
- Codex exécute les tests concernés avant de proposer une Pull Request.
- Pour un changement qui ne justifie pas de tests — par exemple documentaire ou visuel sans logique fonctionnelle — Codex explique brièvement pourquoi dans le compte rendu de la Pull Request.
- Ne pas créer de tests artificiels pour augmenter leur nombre.

## Principes éditoriaux et fonctionnels du portfolio

- Ordonner les projets selon leur pertinence pour un profil d'administrateur systèmes et réseaux : infrastructure/virtualisation, réseaux/sécurité, supervision/observabilité, automatisation/CI/CD/exploitation, puis développement et outils. La métadonnée `order` des fiches est la source de l'ordre ; `featuredOrder` ne règle que l'accueil.
- La page d'accueil présente toujours exactement trois projets mis en avant. Les choisir selon leur pertinence pour l'orientation professionnelle de Michel — administration systèmes et réseaux, DevOps et automatisation, infrastructure, sécurité et observabilité — en tenant compte des compétences démontrées, de la complexité technique et des responsabilités réellement exercées, pas seulement de leur date de création.
- À l'ajout d'un projet, Codex évalue s'il mérite de remplacer l'un des trois projets mis en avant ; un nouveau projet ne devient pas automatiquement mis en avant. Tous les autres projets restent accessibles sur la page Projets.
- Chaque projet doit proposer un visuel interactif pertinent pour comprendre ou explorer son sujet. Préserver une alternative compréhensible, la navigation au clavier et le respect de `prefers-reduced-motion`.
- Décrire honnêtement les contributions : distinguer les responsabilités de conduite, architecture, validation et exploitation de Michel de l'assistance de Codex pour le développement du site. Ne pas attribuer à Michel du code produit avec Codex.
- Ne jamais publier de données privées d'infrastructure depuis les composants publics. Les données dynamiques doivent venir d'une liste explicitement autorisée, être filtrées par le producteur et n'exposer que des champs publics validés ; aucun secret, adresse interne ou détail d'accès.
- Favoriser des fonctionnalités qui apportent une valeur réelle au visiteur sans ajouter de complexité ou de dépendance injustifiée.

## Déploiement

- Ne jamais déployer automatiquement en production depuis une session Codex.
- Les déploiements sont gérés par GitHub Actions.
- Ne jamais exposer les identifiants SFTP ou les secrets GitHub.
- Vérifier que les workflows CI passent avant toute mise en production.

## Documentation et README

À chaque itération, vérifier l'impact des changements sur la documentation. Le README est la vitrine concise du dépôt :

- Le garder professionnel et facile à parcourir ; présenter le portfolio, ses technologies, sa structure, les commandes essentielles et les pratiques de contribution sans devenir une documentation exhaustive.
- Placer les détails techniques dans les fiches projet ou les fichiers de `docs/`, avec des liens depuis le README lorsque c'est utile. Éviter les répétitions et supprimer les informations obsolètes ou sans valeur pour un nouveau lecteur.
- Maintenir exacts l'état opérationnel, les travaux en cours, les évolutions prévues, l'hébergement et la chaîne CI/CD. Ne jamais présenter comme terminée une fonctionnalité qui n'a pas été implémentée ou validée.
- Inclure les modifications du README dans le commit concerné lorsqu'elles documentent directement une évolution du code. Si aucune modification n'est nécessaire, l'indiquer brièvement dans le récapitulatif final.

**Contexte actuel :** le portfolio est hébergé chez OVHcloud. Sa migration vers le homelab est un objectif à court terme, mais elle n'est pas encore réalisée.

## CI/CD — Périmètre d'intervention de Codex

La CI/CD du portfolio est un projet d'apprentissage DevOps que Michel conçoit, configure et maintient personnellement. Codex ne modifie aucun de ses éléments sans demande explicite de Michel, y compris :

- Workflows GitHub Actions, configuration des pipelines et scripts CI/CD ou de déploiement.
- Mécanismes de déploiement, règles de protection des branches, secrets, autorisations, variables et paramètres GitHub.
- Déclencheurs automatiques, notamment ceux associés aux pushes.

Codex produit du code testable et exécute localement les tests pertinents. Toute décision ou évolution concernant l'intégration des tests aux pipelines relève de Michel. Si une évolution du portfolio nécessite un changement de CI/CD, Codex signale le besoin et peut décrire la recommandation sans l'appliquer. Les vérifications existantes peuvent être exécutées localement sans en modifier la configuration.

Le README décrit uniquement l'état CI/CD effectivement réalisé et validé.
