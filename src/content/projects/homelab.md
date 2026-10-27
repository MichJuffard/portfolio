---
title: "Homelab · Proxmox, réseau et supervision"
summary: "Un serveur Proxmox de 8 Go pour pratiquer la virtualisation, l’accès distant sécurisé, la publication contrôlée et l’observabilité privée."
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

Ce laboratoire sert à pratiquer l’administration système et réseau, la sécurité, la virtualisation et la supervision sur un serveur physique de **8 Go de RAM**. Cette capacité limitée rend la mesure des ressources utile au quotidien : comprendre les consommations avant d’ajouter ou de redimensionner un service.

Les environnements sont séparés par rôle : une VM Debian démarrée à la demande, un LXC WireGuard pour l’accès distant, un LXC de collecte et publication contrôlée, et un LXC dédié à l’observabilité privée.

## Architecture actuelle

Proxmox VE héberge une VM et trois LXC. Le schéma interactif distingue la supervision privée, les accès d’administration et les fichiers qui sont volontairement publiés. L’inventaire dynamique reste la source de vérité pour les environnements autorisés à apparaître sur le portfolio.

Les détails du réseau domestique, les paramètres d’accès et les identifiants internes ne sont pas publiés.

## VPN distant avec WireGuard

### Besoin et choix d’architecture

Je voulais administrer le homelab à distance sans rendre son interface d’administration directement accessible sur Internet. WireGuard fournit cet accès sécurisé ; le tunnel a été testé depuis un réseau mobile. Les détails réseau et les paramètres d’accès ne sont pas publiés.

- **Proxmox VE** centralise l’administration du serveur physique, des conteneurs et des machines virtuelles.
- **WireGuard plutôt qu’un service VPN hébergé :** ce choix privilégie les logiciels libres, limite les dépendances à des services externes et permet de comprendre le fonctionnement d’un accès distant sécurisé.

### Mise en place

L’accès distant repose sur WireGuard. Le portfolio ne publie ni emplacement, ni identifiant de machine, ni paramètre réseau ou d’authentification.

Les détails de configuration ne sont pas nécessaires à la présentation publique.

### Tests et résultat

J’ai testé l’accès à l’administration depuis un appareil connecté à un réseau mobile extérieur. Ce test confirme le fonctionnement à ce moment-là ; il ne constitue ni un audit de sécurité ni une preuve de disponibilité continue. Dans l’inventaire, l’état « Actif » décrit uniquement l’état fourni par Proxmox et ne valide pas le tunnel VPN de bout en bout.

Le renforcement général de la sécurité ainsi que les sauvegardes et la procédure de restauration restent à travailler.

## Inventaire public des environnements

La visualisation au-dessus de cette fiche lit `/data/homelab-inventory.json`, un fichier statique publié sur OVHcloud. Le collecteur sélectionne uniquement les environnements marqués `portfolio-public` ; un environnement reste privé par défaut tant que cette décision explicite n’a pas été prise. Le navigateur ne contacte jamais Proxmox.

Le contrat enrichi attendu contient `collected_at` et, pour chaque service, `id`, `name`, `description`, `type` et `status`. Le nom et la description sont des métadonnées éditoriales publiques maintenues par le collecteur ; le frontend ne les déduit pas du nom technique et ne lit pas la description interne Proxmox. Les anciens objets sans `id` ni `description` restent acceptés pendant la transition. En leur absence, le site affiche un nom ou une description de remplacement neutre, sans inventer de rôle.

Le site relit le fichier toutes les trois minutes et traite les données comme anciennes après quinze minutes. Un état « Actif » décrit uniquement l’état fourni par Proxmox au moment de la collecte ; il ne prouve pas la disponibilité d’une application ni le bon fonctionnement du tunnel VPN.

Le générateur du LXC 102 n’est pas présent dans ce dépôt et n’a pas été modifié. Jusqu’à ce qu’il publie les champs `id` et `description` dans le JSON, l’inventaire reste fonctionnel grâce à la compatibilité historique, mais les descriptions publiques ne peuvent pas apparaître automatiquement.

## Supervision privée et capacité du serveur

Le LXC `103 — observability` sépare l’observation technique de la publication du site. **PVE Exporter** interroge l’API Proxmox en HTTPS en vérifiant le certificat TLS, au moyen d’un jeton dédié aux permissions de lecture nécessaires. L’exporter et **Prometheus** écoutent localement dans le LXC ; Prometheus collecte les métriques toutes les 60 secondes et conserve sept jours d’historique.

**Grafana OSS** présente un tableau de bord privé, accessible pour l’administration par tunnel SSH. Il n’est pas exposé sur Internet et les séries détaillées ne sont pas transmises au portfolio. Le tableau de bord réunit des jauges CPU et mémoire globales, des courbes CPU et RAM par VM/LXC, la RAM en valeur absolue et en pourcentage, ainsi que l’occupation des stockages `local` et `local-lvm`, avec historique et seuils visuels.

Le besoin principal est de surveiller et d’optimiser les ressources d’un hôte limité à 8 Go de RAM. Une collecte par service permet d’identifier les consommations et d’éclairer les choix de capacité ; elle n’établit pas à elle seule la disponibilité fonctionnelle des applications.

## Collecte et publication périodique

Le LXC `102 — monitoring` a une responsabilité distincte : il collecte l’inventaire et un petit ensemble de mesures, puis publie `/data/homelab-inventory.json` et `/data/homelab-metrics.json` comme fichiers statiques vers l’hébergement OVHcloud. L’inventaire ne contient que les VM et LXC explicitement marqués `portfolio-public`. Le fichier de mesures existant expose seulement `collected_at`, `cpu_percent`, `memory_percent` et `storage_percent`.

Le widget public se limite à ces pourcentages, notamment au stockage `rootfs` du nœud. Il n’expose ni Prometheus, ni Grafana, ni les courbes détaillées par machine. Le navigateur lit les fichiers publics ; il ne contacte jamais directement Proxmox ou les LXC.

La collecte publique et la supervision privée sont deux flux distincts. Le premier publie un inventaire autorisé et quelques pourcentages ; le second conserve l’historique détaillé dans Prometheus et l’affiche dans Grafana sans exposition publique. Le portfolio reste hébergé chez OVHcloud ; sa migration vers le homelab est toujours prévue et n’a pas été réalisée.

## Diagnostic réseau : du symptôme à la résolution

Lors de la mise en place initiale, Proxmox était relié en Ethernet à un répéteur Wi-Fi Free lui-même connecté à la Freebox. Proxmox ne joignait pas correctement sa passerelle. Les vérifications ARP et les tests de connectivité ont permis de localiser le problème sur la liaison ou l’association du répéteur avec la Freebox, et non sur le câble Ethernet du serveur. La configuration du répéteur depuis Freebox Connect a rétabli la communication.

Cette investigation m’a appris à vérifier un chemin réseau segment par segment : une liaison locale fonctionnelle ne garantit pas que le lien amont le soit aussi.

## Compétences et apprentissages

Proxmox VE, VM Debian, LXC, WireGuard, Prometheus, PVE Exporter et Grafana. Le projet met en pratique la virtualisation, la gestion des ressources, l’administration système, l’accès distant sécurisé, la supervision et le filtrage de données publiques.

## Prochaines étapes

Ces éléments ne sont pas encore réalisés :

- renforcer davantage la sécurité générale de l’accès distant ;
- mettre en place un DNS dynamique pour l’accès distant ;
- définir et tester la sauvegarde et la restauration du conteneur VPN ;
- étudier Nextcloud pour les fichiers et photos personnels, avec une stratégie de stockage et de sauvegarde adaptée ;
- expérimenter Docker, un reverse proxy et l’automatisation dans un environnement dédié ;
- éventuellement étendre prudemment l’accès distant à d’autres environnements.
