# Référence du portfolio de Michel Juffard

## Positionnement

Portfolio professionnel en français pour présenter Michel Juffard et faciliter les échanges avec des recruteurs et des professionnels. Positionnement : **systèmes, réseaux & cybersécurité**. Après plusieurs années en restauration, Michel a participé à la Piscine de 42 Lyon en juillet 2023, puis a commencé sa formation en informatique en novembre 2023. Il développe ses compétences en programmation, Linux, réseaux, cybersécurité, infrastructure et DevOps par les projets. Il est aussi tuteur à 42 Lyon. Il recherche un stage de 6 mois en informatique ou une alternance de 2 ans dans le cadre de la préparation du titre RNCP 39774 « Expert en architecture informatique », option « Architecture des systèmes d’information et réseaux ». Sa recherche se concentre sur Grenoble et sa région ; il est disponible immédiatement, ouvert au développement logiciel et aux premiers CDI juniors.

Le ton doit rester naturel et professionnel. Présenter les compétences comme des apprentissages appuyés par les projets, sans transformer des intérêts en expertise acquise. La navigation principale est Accueil, Projets, À propos et Contact.

## Stack et fonctionnement

- Astro avec génération statique, TypeScript strict, collections Markdown et CSS natif.
- Aucun framework supplémentaire, backend, CMS, base de données ou service d’analytics.
- Les démonstrations interactives sont locales et pédagogiques ; leurs algorithmes ne sont pas à modifier dans une mission éditoriale ou visuelle.
- La page Projets reste consultable sans JavaScript ; les filtres apparaissent lorsque le script est disponible.
- Les fiches de projet commencent par un résumé de l’objectif, des contributions établies, des apprentissages et des technologies. Les informations inconnues sont omises. Les fiches longues peuvent proposer un sommaire interne.
- Le portfolio Astro est en production sur `mjuffard.fr`, dans l’offre gratuite Free Hosting d’OVHcloud incluse avec le domaine. Michel gère les déploiements par la CI/CD et le transfert des fichiers générés. `src/data/site.ts` centralise la configuration du domaine public.

## Identité et contact publics

- GitHub : [MichJuffard](https://github.com/MichJuffard)
- E-mail : [juffard.michel@gmail.com](mailto:juffard.michel@gmail.com)
- LinkedIn : [Michel Juffard](https://www.linkedin.com/in/michel-juffard/)

Ne publier ni adresse IP, ni nom interne de machine, ni secret, ni autre coordonnée personnelle. Ne créer aucun lien personnel non confirmé.

## Projets et contributions établies

- Les projets d’école documentés sont Minishell, miniRT, Inception, Webserv, Transcendance, ft_ping, CTF (Snowcrash, Rainfall et Override) et Linear regression.
- ft_ping est en cours. La fiche distingue le travail déjà présent de l’intégration du cycle complet d’envoi et de réception, qui n’est pas achevée.
- Minishell est un projet en binôme : Michel a réalisé le moteur d’exécution et le parcours de l’arbre ; son binôme a réalisé le parsing et la construction de l’arbre.
- Transcendance est un projet collectif. Les contributions confirmées de Michel sont l’authentification, le backend des tournois et le DevOps/monitoring.
- Ne pas attribuer de contribution individuelle aux autres projets sans fait confirmé.

## Homelab

Le homelab Proxmox est un environnement réel d’apprentissage et d’expérimentation, avec plusieurs VM et LXC. Les services installés et configurés comprennent WireGuard pour l’accès distant sécurisé, Prometheus, Grafana et PVE Exporter pour la supervision, ainsi qu’un collecteur qui utilise l’API Proxmox pour préparer l’inventaire et les métriques publiés sur le portfolio.

La publication de l’inventaire est autorisée explicitement par le tag `portfolio-public` ; les descriptions visibles proviennent d’un catalogue éditorial. Le site lit des fichiers JSON statiques sur OVHcloud et ne contacte pas Proxmox directement. La supervision et les données présentées sur le portfolio s’appuient donc sur l’infrastructure réelle, pas sur un échantillon fictif.

Le serveur Proxmox est actuellement éteint pour économiser ses ressources et l’électricité lorsqu’il n’est pas nécessaire. Le projet n’est pas abandonné : l’arrêt suspend les services hébergés et les nouvelles collectes, tandis que le portfolio reste en ligne indépendamment chez OVHcloud. Les derniers fichiers publiés peuvent devenir anciens ; le site affiche l’heure de collecte et conserve ses états de disponibilité et de fraîcheur. Les services configurés ne sont pas présentés comme accessibles en permanence.

Les premières investigations réseau, notamment le diagnostic d’une connectivité défaillante entre Proxmox et sa passerelle, sont des éléments historiques résolus. Les prochaines améliorations citées dans les fiches restent des pistes d’apprentissage et ne décrivent pas nécessairement des travaux planifiés.

## Références de maintenance

- Développement : `npm run dev`
- Vérification Astro et TypeScript : `npm run check`
- Build statique : `npm run build`
- Tests des démos : `node --experimental-strip-types --test scripts/*.test.mjs`
- Les redirections historiques vers `/projets/homelab/` et `/projets/ctf/` restent déclarées dans `astro.config.mjs`.

Le portfolio statique Astro est déjà en production sur `mjuffard.fr` chez OVHcloud. Le homelab reste consacré à l’apprentissage, aux expérimentations et à la supervision ; une migration future du portfolio reste théoriquement possible, mais elle n’est ni planifiée ni prioritaire.
