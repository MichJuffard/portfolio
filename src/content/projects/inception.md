---
title: "Inception"
summary: "Une infrastructure Docker Compose de huit services : WordPress derrière Nginx en HTTPS, MariaDB, Redis et outils d’administration, avec volumes persistants et provisionnement automatisé."
status: "terminé"
category: "École 42"
featured: true
featuredOrder: 1
featuredTitle: "Inception · infrastructure conteneurisée"
featuredSummary: "Huit services Docker Compose : HTTPS avec Nginx, WordPress, MariaDB et Redis, avec provisionnement automatisé et volumes persistants."
featuredTags: ["Docker Compose", "Nginx", "Volumes"]
tags: ["Docker", "Docker Compose", "Nginx", "WordPress", "MariaDB", "Redis"]
objective: "Assembler huit services conteneurisés avec HTTPS, stockage persistant et dépendances de démarrage explicites."
learnings: "Mettre en relation les services, configurer Nginx en HTTPS, organiser les volumes et le démarrage, et provisionner WordPress."
order: 2
---

## Assembler une infrastructure web

Inception consiste à faire fonctionner plusieurs services isolés, chacun dans son conteneur, en comprenant leurs connexions, leur configuration et leurs besoins de stockage.

Mon infrastructure comprend **huit services**, construits avec des Dockerfiles dédiés et assemblés avec **Docker Compose** : Nginx, WordPress, MariaDB, Redis, FTP, un site statique, Adminer et Portainer.

## Le parcours d’une requête

**Nginx** reçoit les requêtes HTTPS sur le port 443. Sa configuration accepte TLS 1.2 et TLS 1.3 et distingue plusieurs virtual hosts selon le nom d’hôte demandé.

Pour WordPress, les requêtes PHP sont transmises à **PHP-FPM** par FastCGI. WordPress utilise **MariaDB** pour sa base et **Redis** comme cache objet. Les fichiers du site sont partagés entre WordPress et Nginx par un volume.

D’autres virtual hosts transmettent les requêtes vers le site statique, Adminer ou Portainer. Le service FTP dispose de ses propres ports d’accès pour les transferts de fichiers.

## Construire et provisionner les services

Les images du socle Nginx, WordPress et MariaDB partent d’**Alpine Linux**, avec installation des paquets, configuration et scripts d’entrée personnalisés.

Le script WordPress utilise **WP-CLI** au premier lancement : téléchargement, création de la configuration, installation du site puis activation du plugin `redis-cache`. La présence de `wp-config.php` conditionne cette initialisation. PHP-FPM s’exécute ensuite sous `www-data`.

Le Makefile prépare notamment les fichiers d’environnement, les répertoires de stockage et les certificats auto-signés utilisés pour le projet local. La clé et le certificat TLS sont montés via les secrets Compose ; leur contenu n’est pas publié dans ce portfolio.

## Organiser les dépendances de démarrage

Le fichier Compose déclare des **healthchecks** pour plusieurs services et utilise des conditions de dépendance : WordPress et Adminer attendent MariaDB ; Nginx attend notamment WordPress, Adminer et Portainer.

Les contrôles sont adaptés aux services : commande de vérification MariaDB, validation de configuration PHP-FPM, `redis-cli ping` ou requête HTTP. Ils décrivent les conditions prévues dans le projet, sans constituer une mesure en direct dans cette fiche.

## Conserver les données au-delà des conteneurs

Quatre volumes nommés utilisent des montages vers des répertoires de l’hôte :

- **wordpress_files** : application, configuration et fichiers WordPress, partagés aussi avec Nginx et FTP.
- **wordpress_db** : fichiers de la base MariaDB.
- **redis** : données du service Redis.
- **portainer_data** : données de l’interface d’administration Docker.

Cette séparation distingue le cycle de vie des conteneurs de celui des données. Le réseau bridge commun permet aux services de se joindre par leur nom, sans utiliser des adresses IP codées en dur.

## Les services complémentaires

**Adminer** fournit l’interface d’administration SQL. **Portainer** propose une interface Docker avec accès à la socket du moteur. **FTP** partage les fichiers WordPress, tandis que le **site statique** reste un service web séparé.

Ces ajouts étendent le socle web et permettent de travailler le routage, les montages partagés, la configuration de services différents et leur intégration dans une même infrastructure.

## Compétences mises en pratique

- Construire des images et écrire leurs scripts de démarrage.
- Relier reverse proxy, exécution PHP, base de données et cache.
- Configurer TLS et le routage par nom d’hôte.
- Organiser volumes, secrets, variables d’environnement et réseau Docker.
- Automatiser le provisionnement et décrire les dépendances des services.

## À propos du visuel

La carte interactive reprend la configuration du dépôt. Elle permet d’explorer le rôle, les connexions, le stockage et le démarrage de chaque service. Elle ne lance aucun conteneur et ne présente pas d’état de santé en direct.
