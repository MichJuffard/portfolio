---
title: "Homelab · Proxmox, réseau et supervision"
summary: "Homelab Proxmox réel : virtualisation, WireGuard et supervision. Serveur actuellement éteint ; les données publiées peuvent dater."
status: "en cours"
category: "Personnel"
monitoringEnabled: true
featured: true
featuredOrder: 1
featuredTitle: "Homelab · administration et observabilité"
featuredSummary: "Proxmox, WireGuard et supervision privée conçus autour d’un serveur physique limité à 8 Go de RAM."
featuredTags: ["Proxmox", "WireGuard", "Prometheus"]
tags: ["Proxmox VE", "VM", "LXC", "WireGuard", "Debian", "Prometheus", "Grafana"]
objective: "Administrer et faire évoluer un serveur Proxmox de 8 Go de RAM en travaillant la virtualisation, l’accès distant, la sécurité et l’observabilité."
contribution: "J’ai installé et administre le serveur, défini les environnements et configuré WireGuard et la supervision. Codex intervient comme outil de développement du portfolio, pas dans la configuration de l’infrastructure."
learnings: "Gérer des VM et LXC, sécuriser un accès distant, limiter les droits API, surveiller la capacité et séparer les données publiques des métriques privées."
order: 1
---

## Contexte et objectif

Ce homelab est un environnement réel d’apprentissage et d’expérimentation autour de Proxmox, de plusieurs VM et LXC et d’un serveur physique de **8 Go de RAM**. Il a servi à pratiquer l’administration système et réseau, l’accès distant sécurisé, la virtualisation et la supervision. La capacité limitée rend la mesure des ressources utile pour comprendre les consommations et dimensionner les services.

WireGuard, Prometheus, Grafana et PVE Exporter ont été installés et configurés. Un collecteur interroge l’API Proxmox pour produire des fichiers publics d’inventaire et de métriques. Ces réalisations sont distinctes de la disponibilité actuelle des services : le serveur Proxmox est volontairement éteint pour économiser ses ressources et sa consommation électrique lorsqu’il n’est pas nécessaire. Le projet reste un environnement d’apprentissage actif ; l’arrêt ne signifie pas qu’il a été abandonné ni que ses fonctionnalités n’ont jamais fonctionné.

Le portfolio reste hébergé indépendamment sur l’offre gratuite Free Hosting d’OVHcloud, incluse avec `mjuffard.fr`. Quand le serveur est éteint, les fichiers JSON déjà publiés restent accessibles sur le site, mais les collectes ne sont pas renouvelées et leurs données peuvent devenir anciennes. Les composants affichent leur état de disponibilité et l’heure de dernière collecte selon leur logique existante.

## Architecture implémentée

Le schéma interactif présente l’architecture réelle configurée : les environnements VM/LXC autorisés, les flux d’administration et de supervision privée, ainsi que la publication de données vers le portfolio. Il reflète les services et leur état rapporté à la dernière collecte ; il ne garantit pas leur disponibilité continue.

Les détails du réseau domestique, les paramètres d’accès et les identifiants internes ne sont pas publiés.

## VPN distant avec WireGuard

### Besoin et choix d’architecture

Je voulais administrer le homelab à distance sans rendre son interface d’administration directement accessible sur Internet. WireGuard a été configuré pour cet accès sécurisé et le tunnel a été testé depuis un réseau mobile lorsque le serveur était actif. Cette configuration ne signifie pas que l’accès distant est disponible pendant l’arrêt du serveur. Les détails réseau et les paramètres d’accès ne sont pas publiés.

- **Proxmox VE** centralise l’administration du serveur physique, des conteneurs et des machines virtuelles.
- **WireGuard plutôt qu’un service VPN hébergé :** ce choix privilégie les logiciels libres, limite les dépendances à des services externes et permet de comprendre le fonctionnement d’un accès distant sécurisé.

### Mise en place

L’accès distant configuré repose sur WireGuard. Le portfolio ne publie ni emplacement, ni identifiant de machine, ni paramètre réseau ou d’authentification.

Les détails de configuration ne sont pas nécessaires à la présentation publique.

### Tests et résultat

J’ai testé l’accès à l’administration depuis un appareil connecté à un réseau mobile extérieur. Ce test confirme le fonctionnement à ce moment-là ; il ne constitue ni un audit de sécurité ni une preuve de disponibilité continue. Dans l’inventaire, l’état « Actif » décrit uniquement l’état fourni par Proxmox et ne valide pas le tunnel VPN de bout en bout.

Le renforcement général de la sécurité ainsi que les sauvegardes et la procédure de restauration restent à travailler.

## Inventaire public des environnements

Le schéma d’infrastructure au-dessus de cette fiche intègre les environnements chargés depuis `/data/homelab-inventory.json`, un fichier statique publié sur OVHcloud. Le collecteur utilise l’API Proxmox et sélectionne uniquement les environnements marqués `portfolio-public` ; leurs descriptions publiques proviennent d’un catalogue éditorial. Un environnement reste privé par défaut tant que cette décision explicite n’a pas été prise. Le navigateur ne contacte jamais Proxmox.

Le contrat publié contient `collected_at` et, pour chaque service, `id`, `name`, `description`, `type` et `status`. Le frontend ne déduit pas les descriptions du nom technique et ne lit pas la description interne Proxmox. Pour compatibilité, les anciens objets sans `id` ni `description` restent acceptés ; en leur absence, le site affiche un nom ou une description de remplacement neutre, sans inventer de rôle.

Le site relit le fichier toutes les trois minutes et traite les données comme anciennes après quinze minutes. Le serveur étant actuellement éteint, les données existantes peuvent donc apparaître comme périmées jusqu’à la reprise des collectes. Un état « Actif » décrit uniquement l’état fourni par Proxmox au moment de la collecte ; il ne prouve pas la disponibilité actuelle d’une application ni le bon fonctionnement du tunnel VPN.

## Supervision privée et capacité du serveur

La supervision privée sépare l’observation technique de la publication du site. **PVE Exporter** interroge l’API Proxmox en HTTPS en vérifiant le certificat TLS, au moyen d’un jeton dédié aux permissions de lecture nécessaires. L’exporter et **Prometheus** écoutent localement ; la configuration prévoit une collecte des métriques toutes les 60 secondes et sept jours d’historique.

**Grafana OSS** présente un tableau de bord privé, accessible pour l’administration par tunnel SSH quand le serveur est actif. Il n’est pas exposé sur Internet et les séries détaillées ne sont pas transmises au portfolio. Le tableau de bord réunit des jauges CPU et mémoire globales, des courbes CPU et RAM par VM/LXC, la RAM en valeur absolue et en pourcentage, ainsi que l’occupation des stockages `local` et `local-lvm`, avec historique et seuils visuels. Ces outils sont configurés dans le homelab ; leur présence ne signifie pas qu’ils sont nécessairement accessibles en permanence.

Le besoin principal est de surveiller et d’optimiser les ressources d’un hôte limité à 8 Go de RAM. Une collecte par service permet d’identifier les consommations et d’éclairer les choix de capacité ; elle n’établit pas à elle seule la disponibilité fonctionnelle des applications.

## Collecte et publication périodique

Le collecteur a une responsabilité distincte de la supervision privée : il utilise l’API Proxmox pour obtenir l’inventaire et un petit ensemble de mesures, puis publie `/data/homelab-inventory.json` et `/data/homelab-metrics.json` comme fichiers statiques sur l’hébergement OVHcloud. L’inventaire ne contient que les VM et LXC explicitement marqués `portfolio-public` et leurs descriptions issues du catalogue. Le fichier de mesures expose seulement `collected_at`, `cpu_percent`, `memory_percent` et `storage_percent`.

Le widget public se limite à ces pourcentages, notamment au stockage `rootfs` du nœud. Il n’expose ni Prometheus, ni Grafana, ni les courbes détaillées par machine. Le navigateur lit les fichiers publics ; il ne contacte jamais directement Proxmox ou les LXC.

La collecte publique et la supervision privée sont deux flux distincts. Le premier publie un inventaire autorisé et quelques pourcentages ; le second conserve l’historique détaillé dans Prometheus et l’affiche dans Grafana sans exposition publique. Le portfolio reste en production sur l’offre gratuite Free Hosting d’OVHcloud, indépendamment du homelab. Une migration future vers le homelab reste théoriquement possible, mais elle n’est ni planifiée ni prioritaire.

## Diagnostic réseau : du symptôme à la résolution

Lors de la mise en place initiale, Proxmox était relié en Ethernet à un répéteur Wi-Fi Free lui-même connecté à la Freebox. Proxmox ne joignait pas correctement sa passerelle. Les vérifications ARP et les tests de connectivité ont permis de localiser le problème sur la liaison ou l’association du répéteur avec la Freebox, et non sur le câble Ethernet du serveur. La configuration du répéteur depuis Freebox Connect a rétabli la communication.

Cette investigation m’a appris à vérifier un chemin réseau segment par segment : une liaison locale fonctionnelle ne garantit pas que le lien amont le soit aussi.

## Compétences et apprentissages

Proxmox VE, VM Debian, LXC, WireGuard, Prometheus, PVE Exporter et Grafana. Le projet met en pratique la virtualisation, la gestion des ressources, l’administration système, l’accès distant sécurisé, la supervision et le filtrage de données publiques.

## Pistes d’amélioration envisagées

Ces pistes ont été évoquées comme sujets d’expérimentation, sans calendrier de réalisation. Leur statut actuel n’est pas renseigné dans le dépôt :

- renforcer davantage la sécurité générale de l’accès distant ;
- mettre en place un DNS dynamique pour l’accès distant ;
- définir et tester la sauvegarde et la restauration du conteneur VPN ;
- étudier Nextcloud pour les fichiers et photos personnels, avec une stratégie de stockage et de sauvegarde adaptée ;
- expérimenter Docker, un reverse proxy et l’automatisation dans un environnement dédié ;
- éventuellement étendre prudemment l’accès distant à d’autres environnements.
