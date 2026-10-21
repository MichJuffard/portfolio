---
title: "Webserv"
summary: "Un serveur HTTP en C++98 : sockets, boucle d’événements epoll, parsing des requêtes, configuration des routes et exécution CGI."
status: "terminé"
category: "École 42"
featured: false
tags: ["C++98", "HTTP", "Sockets", "epoll", "CGI"]
objective: "Implémenter sous Linux un serveur HTTP qui reçoit des requêtes, route les ressources et peut exécuter des CGI."
learnings: "Mettre en pratique les sockets, epoll, les états de parsing, les routes HTTP, les réponses et l’exécution CGI."
order: 4
---

## Comprendre ce qui répond au navigateur

Webserv met en œuvre un serveur HTTP en **C++98**, à partir des sockets système. Le projet relie la réception des données, l’analyse d’une requête, le choix d’une ressource et la construction de la réponse envoyée au client.

Le code fourni cible **Linux** : sa boucle principale s’appuie sur `epoll`.

## Une architecture pilotée par les événements

La classe `Server` crée les sockets d’écoute et les inscrit dans une instance `epoll`. La boucle `Server::run` attend les événements puis les répartit selon le type de descripteur : connexion serveur, client ou CGI.

`Connection` porte la socket d’écoute ; `Client` représente une connexion acceptée. Les données reçues alimentent un objet `Request`, dont les états distinguent la lecture des en-têtes, celle du corps et la requête prête à être traitée.

Ce découpage met en pratique la gestion de plusieurs connexions par une boucle d’événements, avec un suivi des descripteurs et de l’état de chaque requête.

## Analyser, router et répondre

- **Méthodes HTTP :** le code traite GET, POST et DELETE ; les autres méthodes sont refusées avec un statut 405.
- **Corps de requête :** le parsing distingue les données de longueur connue (`Content-Length`) et les transferts par morceaux (`Transfer-Encoding`).
- **Ressources :** lecture de fichiers, détermination des types MIME, écriture du corps POST dans un fichier et suppression de fichiers via DELETE.
- **Réponses :** construction des en-têtes et du contenu HTTP, pages d’erreur configurables et message de repli.
- **Délai client :** la boucle prévoit un contrôle d’inactivité et un statut 408 après expiration du délai défini dans le code.

## Une configuration par serveur et par route

Le fichier de configuration contient plusieurs blocs `server` et `location`. Le parsing prévoit les adresses et ports d’écoute, les noms de serveur, les racines de contenu, les méthodes autorisées, les fichiers d’index et l’autoindex.

Les exemples de configuration incluent aussi une limite de taille du corps, des pages d’erreur personnalisées, des emplacements d’upload, une redirection 301 et l’association d’extensions à des interpréteurs CGI.

## Produire une réponse dynamique avec CGI

La configuration associe notamment `.py` à Python et `.php` à PHP CGI. Le code construit l’environnement du script, crée une `socketpair`, puis utilise `fork` et `execve` pour lancer l’interpréteur dans un processus enfant. Sa sortie standard est redirigée vers la socket ; le serveur analyse ensuite cette sortie pour préparer la réponse HTTP.

Cette partie relie programmation réseau et gestion des processus : descripteurs, héritage, redirection et communication entre le serveur et le programme exécuté.

## Compétences mises en pratique

- Structurer un projet C++98 autour des responsabilités serveur, connexion, requête, parsing et CGI.
- Relier le protocole HTTP aux lectures et écritures sur des sockets.
- Gérer les états d’une requête dont les données peuvent arriver en plusieurs lectures.
- Transformer une configuration textuelle en règles de traitement.
- Articuler boucle d’événements, ressources système et processus externes.

## À propos du visuel

Le schéma et les parcours interactifs illustrent la structure relevée dans le dépôt. Les chemins et contenus affichés sont des exemples pédagogiques, sans requête réseau réelle ni exécution du serveur C++. Les échanges HTTP sont simplifiés et ne constituent pas des captures de test.
