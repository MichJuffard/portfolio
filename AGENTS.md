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

## Documentation et README

À chaque itération de développement :

1. Relire les modifications effectuées et vérifier si elles ont un impact sur la documentation du projet.
2. Mettre à jour `README.md` dans la même itération pour refléter les fonctionnalités, choix techniques, commandes, procédures et changements de configuration réellement réalisés.
3. Distinguer explicitement les fonctionnalités opérationnelles, les travaux en cours et les évolutions prévues.
4. Maintenir à jour les informations relatives à l'hébergement et à la chaîne CI/CD.
5. Ne jamais documenter une fonctionnalité comme terminée si elle n'a pas été implémentée ou validée.
6. Si aucune modification du README n'est nécessaire, l'indiquer dans le récapitulatif final avec une courte justification.

Les modifications du README doivent faire partie du commit concerné lorsqu'elles documentent directement une évolution du code.

**Contexte actuel :** le portfolio est hébergé chez OVHcloud. Sa migration vers le homelab est un objectif à court terme, mais elle n'est pas encore réalisée.

## CI/CD — Périmètre d'intervention de Codex

La chaîne CI/CD du portfolio constitue un projet d'apprentissage personnel. Je souhaite concevoir, comprendre, maintenir et faire évoluer moi-même les workflows GitHub Actions ainsi que les scripts associés au déploiement.

En conséquence :

- Ne jamais créer, modifier, supprimer ou réorganiser les fichiers de `.github/workflows/` ou les scripts CI/CD sans demande explicite de ma part.
- Ne pas modifier les secrets, variables d'environnement, permissions ou paramètres de déploiement.
- Ne pas ajouter de déclenchement automatique, notamment sur `push`, sans autorisation explicite.
- Si une évolution du portfolio nécessite une adaptation de la CI/CD, signaler le besoin et expliquer les modifications recommandées, sans les appliquer.
- Les commandes de vérification existantes (tests, contrôles de qualité, build) peuvent être exécutées pour valider les changements, sans modifier leur configuration.
- Documenter dans le README les évolutions CI/CD effectivement réalisées et validées.

**Objectif :** utiliser Codex comme assistant pour le développement du portfolio, tout en conservant la maîtrise technique et pédagogique de la chaîne CI/CD.