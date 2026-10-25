---
title: "Homelab personnel · Proxmox, WireGuard et administration Linux"
summary: "Un serveur réutilisé, Proxmox et un VPN WireGuard opérationnel dans un petit conteneur Alpine, avec une VM Debian facultative pour les expérimentations."
status: "en cours"
category: "Personnel"
monitoringEnabled: true
monitoringFallback: "Aucun suivi réel de l’utilisation des ressources n’est encore installé. La mesure et la supervision du homelab restent à réaliser."
featured: true
featuredOrder: 3
featuredTitle: "Homelab · VPN WireGuard"
featuredSummary: "Proxmox, un VPN WireGuard testé à distance dans un LXC Alpine et une VM Debian démarrée à la demande."
featuredTags: ["Proxmox", "WireGuard", "LXC"]
tags: ["Proxmox VE", "LXC", "Alpine Linux", "WireGuard", "iptables", "Debian", "Réseau"]
objective: "Apprendre l’administration système et réseau, la sécurité et la virtualisation sur un serveur aux ressources limitées, puis y mener des expérimentations DevOps."
contribution: "J’ai monté le serveur, choisi l’architecture et configuré Proxmox et WireGuard moi-même, dans une démarche d’apprentissage guidée. Codex m’assiste pour le code et la présentation du portfolio, pas pour la réalisation du VPN. La chaîne CI/CD du site est un chantier distinct que je code et comprends moi-même."
learnings: "Administrer Proxmox, créer un LXC non privilégié, configurer WireGuard et OpenRC, puis diagnostiquer le routage, le NAT et le filtrage jusqu’à valider l’accès distant à Proxmox depuis un réseau mobile."
order: 1
---

## Contexte et objectif

Ce laboratoire sert à apprendre l’administration système et réseau, la sécurité et la virtualisation sur du matériel réutilisé. Je veux aussi préparer un terrain d’expérimentation pour les outils DevOps. Les ressources sont limitées par choix : comprendre les besoins et optimiser l’existant avant de multiplier les machines virtuelles.

Le serveur est une ancienne tour ASUS équipée d’un AMD FX-6300 et de 8 Go de RAM DDR3. Un SSD Intel de 180 Go héberge le système et les environnements actifs. Deux disques supplémentaires, de 1 To et 750 Go, sont réservés à de futurs usages de stockage ; ils ne constituent pas encore une solution de stockage ou de sauvegarde documentée.

## Architecture actuelle

Proxmox VE 9.2 est installé sur le serveur physique. Le serveur est relié en Ethernet à la Freebox et son bridge réseau Proxmox `vmbr0` relie les environnements virtuels au réseau. Deux environnements ont des rôles distincts : le LXC Alpine maintient le VPN disponible, tandis que la VM Debian 13 est facultative et peut être démarrée depuis Proxmox pour les futurs essais Linux, Docker et DevOps. La VM n’est pas requise au fonctionnement du VPN.

Le schéma emploie des rôles génériques et ne détaille pas le LAN domestique. Le sous-réseau indiqué est celui du tunnel VPN ; aucune adresse publique, clé ni donnée d’administration n’est publiée.

## VPN distant avec WireGuard

### Besoin et choix d’architecture

Je voulais administrer Proxmox depuis l’extérieur sans exposer directement son interface d’administration sur Internet. Le VPN fournit un chemin privé entre un Mac client et le serveur. Il donne actuellement accès à Proxmox ; l’accès aux autres VM et conteneurs pourra être ajouté plus tard en adaptant les routes et le filtrage.

- **Proxmox VE** centralise l’administration du serveur physique, des conteneurs et des machines virtuelles.
- **LXC plutôt qu’une VM complète :** le VPN est un service léger qui doit rester disponible. Un conteneur consomme moins de ressources qu’une machine virtuelle dédiée dans ce serveur limité.
- **Alpine Linux plutôt que Debian pour le VPN :** son empreinte réduite convient à ce service ciblé. La VM Debian reste disponible séparément pour apprendre sur un système plus généraliste.
- **WireGuard natif plutôt que Tailscale :** ce choix privilégie les logiciels libres, limite les dépendances à des services externes et permet de comprendre soi-même les pairs, les routes et le filtrage réseau.
- **Un réseau VPN séparé du LAN :** le sous-réseau privé `10.77.0.0/24` est routé explicitement. Le transfert IPv4, les règles iptables et le NAT/MASQUERADE définissent le chemin entre le tunnel et l’interface Proxmox.

### Mise en place

Le VPN tourne dans le conteneur **LXC non privilégié 101**, sous **Alpine Linux 3.23**. Il dispose d’un cœur CPU, de 256 Mio de RAM, de 256 Mio de swap et de 2 Gio de stockage alloué. WireGuard est installé nativement et les services sont gérés par OpenRC. Le pair Mac et le pair serveur ont chacun leurs propres clés ; seules les clés publiques sont échangées entre pairs.

Le transfert IPv4 est activé dans Alpine. Des règles iptables assurent le transfert et la traduction d’adresses NAT/MASQUERADE. La Freebox ne redirige qu’un seul port UDP vers le conteneur ; le port d’administration Proxmox n’est pas directement exposé sur Internet. Le pare-feu IPv6 est activé sur la Freebox et des règles IPv6 locales complètent le filtrage sur Alpine.

Le conteneur démarre automatiquement avec Proxmox. OpenRC lance WireGuard et restaure les règles réseau au démarrage du conteneur afin que le tunnel retrouve son fonctionnement sans intervention manuelle.

### Tests et résultat

Après un redémarrage du conteneur, j’ai vérifié le démarrage automatique de WireGuard et la restauration des règles réseau. J’ai ensuite testé le tunnel depuis un Mac connecté à un réseau mobile extérieur : l’interface Proxmox était accessible à travers WireGuard. Ce test confirme le parcours actuellement configuré ; il ne constitue pas un audit de sécurité ni une validation d’accès aux autres machines.

Le filtrage réseau mérite encore un durcissement plus complet. Les sauvegardes et la procédure de restauration du conteneur restent également à mettre en place.

## VM Debian pour les expérimentations

Une VM Debian 13 distincte existe sur Proxmox. Elle sert de base aux apprentissages Linux et pourra accueillir les expériences Docker et DevOps. Je la démarre à la demande : elle peut rester arrêtée sans couper le VPN, ce qui réserve les ressources du serveur au service qui doit rester disponible.

## Diagnostic réseau : du symptôme à la résolution

Lors de la mise en place initiale, Proxmox était relié en Ethernet à un répéteur Wi-Fi Free lui-même connecté à la Freebox. Proxmox ne joignait pas correctement sa passerelle. Les vérifications ARP et les tests de connectivité ont permis de localiser le problème sur la liaison ou l’association du répéteur avec la Freebox, et non sur le câble Ethernet du serveur. La configuration du répéteur depuis Freebox Connect a rétabli la communication.

Cette investigation m’a appris à vérifier un chemin réseau segment par segment : une liaison locale fonctionnelle ne garantit pas que le lien amont le soit aussi.

## Compétences et apprentissages

Proxmox VE, LXC non privilégié, Alpine Linux, WireGuard, OpenRC, Debian, IPv4/IPv6, routage, iptables, NAT et SSH. Le projet met en pratique la virtualisation, la gestion des ressources, le démarrage des services, l’accès distant et le diagnostic réseau.

## Prochaines étapes

Ces éléments ne sont pas encore réalisés :

- durcir plus complètement les règles de filtrage réseau ;
- mettre en place un DNS dynamique pour l’accès distant ;
- définir et tester la sauvegarde et la restauration du conteneur VPN ;
- mesurer et suivre l’utilisation des ressources du serveur ;
- étudier Nextcloud pour les fichiers et photos personnels, avec une stratégie de stockage et de sauvegarde adaptée ;
- expérimenter Docker, un reverse proxy, le monitoring et l’automatisation dans la VM Debian ;
- éventuellement étendre le VPN à d’autres machines et utilisateurs en adaptant les routes et les règles de filtrage.
