---
title: "Transcendance"
summary: "Une plateforme de Pong multijoueur en TypeScript : jeu en temps réel, tournois, profils et services conteneurisés, avec authentification et supervision."
status: "terminé"
category: "École 42"
featured: true
featuredOrder: 3
featuredTitle: "Transcendance · DevOps & monitoring"
featuredSummary: "Ma contribution : authentification, backend des tournois et DevOps/monitoring d’une plateforme multijoueur. Supervision avec Prometheus, Grafana et Alertmanager."
featuredTags: ["Docker", "Prometheus", "Grafana"]
tags: ["TypeScript", "Fastify", "WebSocket", "Docker", "SQLite"]
objective: "Réaliser en équipe une plateforme de Pong multijoueur avec profils, fonctions sociales, tournois, authentification et supervision."
contribution: "Projet collectif. Mes contributions confirmées portent sur l’authentification, le backend des tournois et le DevOps/monitoring."
learnings: "Relier des services applicatifs, un jeu temps réel via WebSocket, des conteneurs et l’observabilité avec Prometheus, Grafana et Alertmanager."
order: 5
---

## Un jeu au cœur d’une plateforme web

ft_transcendence est un projet collectif de plateforme de **Pong multijoueur en temps réel**. Autour du jeu, l’application rassemble des lobbies, des tournois, des profils utilisateurs, des relations sociales et une authentification avec second facteur.

L’interface adopte les codes visuels d’un journal : titres, colonnes, illustrations et traitement monochrome. Les captures ci-dessus proviennent du dépôt et montrent le résultat de l’application.

## Ma contribution

Dans ce projet d’équipe, mes contributions portent sur trois domaines :

- **Authentification :** développement de la partie authentification de la plateforme.
- **Backend des tournois :** développement de la logique serveur liée aux tournois.
- **DevOps et monitoring :** travail sur l’infrastructure de déploiement et la supervision.

## Jouer et synchroniser les clients

Le frontend est une SPA en **TypeScript**, construite avec **Vite** et **Tailwind CSS**. Le terrain de jeu est dessiné dans un **canvas 2D** : balle, raquettes, obstacles et états de partie.

Les échanges de jeu utilisent **WebSocket**. Un paquet partagé, `pong-shared`, contient notamment la géométrie, des éléments du moteur et les définitions de paquets réseau. La sérialisation distingue les mouvements envoyés par le client des mises à jour reçues du serveur : segments, position et vitesse de la balle, scores et compte à rebours.

Le rendu client estime la position de la balle à partir de sa position et de sa vitesse reçues, pour dessiner les images entre les mises à jour réseau. Le projet relie ainsi simulation du jeu, protocole de communication et affichage dans le navigateur.

## Personnaliser une partie et organiser un tournoi

La création de partie propose des raquettes classiques ou en V, ainsi que plusieurs configurations d’obstacles, dont des losanges et des hexagones. Les lobbies permettent de rejoindre une partie ; le projet comprend aussi un système de tournois avec suivi des matchs.

Les profils rassemblent avatars, statistiques et historique des parties. Le service social complète cet ensemble avec les demandes d’amitié, la présence en ligne et les notifications en temps réel.

## Répartir les responsabilités entre services

Un reverse proxy **Nginx** constitue le point d’entrée vers le frontend et les services **Auth**, **2FA**, **Users**, **Social** et **Game**. Les services backend s’appuient sur **Node.js**, **TypeScript** et **Fastify**.

Les données persistantes sont réparties dans des bases **SQLite** par service, avec des volumes dédiés. Les échanges internes utilisent des API, tandis que les fonctionnalités de jeu et de présence s’appuient également sur WebSocket. L’ensemble est décrit avec **Docker Compose**.

Le monorepo regroupe aussi des paquets communs pour les contrats et utilitaires partagés, la sécurité, la supervision et le jeu. Des tests Jest sont également présents dans le dépôt.

## Authentification et observabilité

L’authentification combine des sessions **JWT**, une intégration **OAuth Google** et un service de second facteur **TOTP**. Cette séparation rend explicites les responsabilités liées à l’identité et aux vérifications de connexion.

La pile de supervision rassemble **Prometheus**, **Grafana** et **Alertmanager**, avec un exporteur Nginx. Elle permet de suivre les métriques des services et les connexions du reverse proxy. La capture de supervision est un état enregistré dans le dépôt, sans données en direct dans le portfolio.

## Compétences illustrées par le projet collectif

- Concevoir une application complète, de l’interface aux services backend.
- Articuler rendu graphique, événements utilisateur et synchronisation réseau.
- Définir et partager des contrats de données entre client et serveur.
- Intégrer authentification, données persistantes et interactions sociales.
- Structurer le déploiement et l’observation d’une application composée de plusieurs services.

## Essayer la map Hexagone

Le canvas jouable reprend la géométrie du terrain du projet : deux obstacles hexagonaux et des raquettes classiques. Cette démo locale propose un adversaire automatique, des commandes clavier, souris et tactiles, ainsi qu’une partie en cinq points. Son moteur est simplifié et indépendant du backend multijoueur ; il ne nécessite ni compte ni connexion à la plateforme.
