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

Ce laboratoire sert à apprendre l’administration système et réseau, la sécurité et la virtualisation sur du matériel réutilisé. Je veux aussi préparer un terrain d’expérimentation pour les outils DevOps. Les ressources sont limitées par choix : comprendre les besoins et optimiser l’existant avant de multiplier les machines virtuelles.

Le serveur repose sur du matériel réutilisé aux ressources limitées. Cette contrainte m’amène à privilégier des environnements ciblés et à optimiser l’existant avant d’ajouter des machines.

## Architecture actuelle

Proxmox VE est installé sur le serveur. L’inventaire dynamique ci-dessus est la source de vérité pour les environnements actuellement autorisés à apparaître sur le portfolio. Le schéma montre uniquement leur relation logique d’hébergement ; le texte de cette fiche décrit le projet et ne remplace pas cette liste.

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

La visualisation au-dessus de cette fiche lit `/data/homelab-inventory.json`, un fichier statique publié sur OVHcloud. Le collecteur privé sélectionne les environnements marqués `portfolio-public` ; un environnement reste privé par défaut tant que cette décision n’a pas été prise. Le navigateur ne contacte jamais Proxmox.

L’inventaire est publié toutes les trois minutes et contient uniquement la date de collecte, le nom public, le type VM ou LXC et l’état. Le site le relit toutes les trois minutes et traite les données comme anciennes après quinze minutes. Un état « Actif » décrit l’état fourni par Proxmox au moment de la collecte ; il ne prouve pas la disponibilité d’une application ni le bon fonctionnement du VPN.

## Monitoring courant du nœud Proxmox

Un collecteur privé extrait les mesures CPU, mémoire et stockage du système de fichiers racine (`rootfs`) du nœud Proxmox.

Une tâche cron lance la collecte et la publication toutes les trois minutes. Le LXC transfère un JSON public minimal en SFTP vers l’hébergement OVHcloud actuel. Le widget lit uniquement ce fichier et marque les données comme périmées lorsque l’horodatage de collecte atteint 15 minutes ; il ne contacte jamais directement Proxmox. La valeur rootfs décrit le stockage système du nœud, pas l’ensemble des disques du homelab.

Ce dispositif affiche uniquement des mesures courantes du nœud. Il n’inclut pas Prometheus, Grafana, de stockage historique ni de système d’alertes, et ne constitue pas une plateforme complète d’observabilité. Le portfolio reste hébergé chez OVHcloud ; sa migration vers le homelab est toujours prévue et n’a pas été réalisée.

## Diagnostic réseau : du symptôme à la résolution

Lors de la mise en place initiale, Proxmox était relié en Ethernet à un répéteur Wi-Fi Free lui-même connecté à la Freebox. Proxmox ne joignait pas correctement sa passerelle. Les vérifications ARP et les tests de connectivité ont permis de localiser le problème sur la liaison ou l’association du répéteur avec la Freebox, et non sur le câble Ethernet du serveur. La configuration du répéteur depuis Freebox Connect a rétabli la communication.

Cette investigation m’a appris à vérifier un chemin réseau segment par segment : une liaison locale fonctionnelle ne garantit pas que le lien amont le soit aussi.

## Compétences et apprentissages

Proxmox VE, LXC non privilégié, Alpine Linux, WireGuard, OpenRC et Debian. Le projet met en pratique la virtualisation, la gestion des ressources, l’administration système, l’accès distant sécurisé et le diagnostic réseau.

## Prochaines étapes

Ces éléments ne sont pas encore réalisés :

- renforcer davantage la sécurité générale de l’accès distant ;
- mettre en place un DNS dynamique pour l’accès distant ;
- définir et tester la sauvegarde et la restauration du conteneur VPN ;
- étudier Nextcloud pour les fichiers et photos personnels, avec une stratégie de stockage et de sauvegarde adaptée ;
- expérimenter Docker, un reverse proxy et l’automatisation dans un environnement dédié ;
- éventuellement étendre prudemment l’accès distant à d’autres environnements.
