# Instructions pour Codex

## Git et commits

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
- Avant chaque commit, vérifier les changements avec `git diff` et `git status`.
- Ne jamais inclure de secrets, d'informations sensibles ou de fichiers générés.
- Exécuter les tests pertinents et les vérifications nécessaires avant de committer.
- Ne committer que les fichiers concernés par la tâche.
- Ne jamais modifier, réécrire ou supprimer des commits existants sans autorisation.
- Ne jamais effectuer de `git push` sans demande explicite.
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

## Déploiement

- Ne jamais déployer automatiquement en production depuis une session Codex.
- Les déploiements sont gérés par GitHub Actions.
- Ne jamais exposer les identifiants SFTP ou les secrets GitHub.
- Vérifier que les workflows CI passent avant toute mise en production.