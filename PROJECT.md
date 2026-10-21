# Référence du portfolio de Michel Juffard

## Positionnement

Portfolio professionnel en français pour présenter Michel Juffard et faciliter les échanges avec des recruteurs et des professionnels. Positionnement : **systèmes, réseaux & cybersécurité**. Michel a rejoint 42 Lyon en juillet 2023 après plusieurs années en restauration, dont un poste de responsable de bar. Il y développe ses compétences en programmation, Linux, réseaux, cybersécurité, infrastructure et DevOps par les projets. Il est aussi tuteur à 42 Lyon. Il recherche actuellement une alternance en systèmes, réseaux ou cybersécurité.

Le ton doit rester naturel et professionnel. Présenter les compétences comme des apprentissages appuyés par les projets, sans transformer des intérêts en expertise acquise. La navigation principale est Accueil, Projets, À propos et Contact.

## Stack et fonctionnement

- Astro avec génération statique, TypeScript strict, collections Markdown et CSS natif.
- Aucun framework supplémentaire, backend, CMS, base de données ou service d’analytics.
- Les démonstrations interactives sont locales et pédagogiques ; leurs algorithmes ne sont pas à modifier dans une mission éditoriale ou visuelle.
- La page Projets reste consultable sans JavaScript ; les filtres apparaissent lorsque le script est disponible.
- Les fiches de projet commencent par un résumé de l’objectif, des contributions établies, des apprentissages et des technologies. Les informations inconnues sont omises. Les fiches longues peuvent proposer un sommaire interne.
- Le domaine public n’est pas encore choisi. `src/data/site.ts` centralise sa future configuration ; les métadonnées absolues sont omises tant qu’il est vide.

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

Le projet personnel utilise Proxmox VE pour héberger une VM Debian administrée en SSH. Le serveur Proxmox était relié en Ethernet à un répéteur Wi-Fi Free, lui-même associé sans fil à la Freebox. Proxmox ne joignait pas correctement sa passerelle. Les investigations ont porté notamment sur ARP et la connectivité. Le problème venait de la liaison ou de l’association du répéteur avec la Freebox. Sa configuration dans Freebox Connect a rétabli la connexion ; les échanges entre le Mac, Proxmox et le réseau local ont ensuite fonctionné.

Le diagnostic est présenté sous la forme symptôme, investigation, cause, résolution et enseignements, sans adresses, noms internes, sorties de commande ni mesures inventées. La fiche décrit comme prévues ou en cours les évolutions non réalisées, notamment l’hébergement avec Nginx, un accès VPN, l’automatisation et une supervision réelle.

Le widget de monitoring est une démonstration : son échantillon est fictif et n’entraîne aucune requête réseau par défaut. Aucun accès direct à Proxmox ni API réelle n’est configuré.

## Références de maintenance

- Développement : `npm run dev`
- Vérification Astro et TypeScript : `npm run check`
- Build statique : `npm run build`
- Tests des démos : `node --experimental-strip-types --test scripts/*.test.mjs`
- Les redirections historiques vers `/projets/homelab/` et `/projets/ctf/` restent déclarées dans `astro.config.mjs`.

Le site est conçu pour un futur hébergement statique. Aucun déploiement, configuration Nginx de production ou changement du homelab ne fait partie de l’état actuel.
