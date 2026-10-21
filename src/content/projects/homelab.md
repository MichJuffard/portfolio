---
title: "Homelab personnel · virtualisation et administration Linux"
summary: "Construire un environnement personnel pour apprendre la virtualisation, administrer Linux et explorer les réseaux."
status: "en cours"
category: "Personnel"
monitoringEnabled: true
monitoringFallback: "Le tableau de bord n’est pas publié actuellement. Le homelab reste présenté à travers son architecture, ses réalisations et les compétences travaillées."
featured: true
featuredOrder: 3
featuredTitle: "Homelab personnel"
featuredSummary: "Proxmox, une VM Debian et les premières étapes d’un laboratoire dédié à la virtualisation, Linux et au réseau."
featuredTags: ["Proxmox", "Debian", "Linux"]
tags: ["Proxmox VE", "Debian", "Linux", "Virtualisation", "SSH", "Réseau"]
objective: "Utiliser un environnement personnel pour apprendre la virtualisation, administrer une VM Debian en SSH et étudier le réseau."
learnings: "Créer et administrer une VM, puis diagnostiquer une connectivité impliquant Ethernet, Wi-Fi, ARP et une passerelle."
order: 1
---

## Contexte et objectif

Réutiliser une machine existante pour disposer d’un environnement d’apprentissage consacré à Linux et à l’administration système. Le laboratoire évolue au fil des expérimentations ; les installations confirmées sont distinguées des étapes encore envisagées.

## Architecture actuelle

Le laboratoire repose sur un ordinateur recyclé équipé d’un processeur AMD FX-6300, de 8 Go de mémoire et d’un SSD de 180 Go. Il exécute Proxmox VE 9.2, qui héberge une machine virtuelle Debian 13. La VM dispose de 2 vCPU, de 2 Go de mémoire et d’un disque virtuel de 20 Go. Elle est connectée au réseau par un bridge virtuel et reçoit son adresse via DHCP.

L’administration SSH depuis le poste de développement a été testée avec succès sur le réseau local. Aucun nom interne de machine, adresse réseau ni identifiant n’est nécessaire pour décrire cette architecture.

## Proxmox

Proxmox est installé sur le matériel disponible et sert d’hyperviseur à la première machine virtuelle. Cette étape a permis de réutiliser l’équipement existant pour poursuivre les expérimentations sans disposer d’un serveur physique par service.

## Debian

Une VM Debian Server a été créée et administrée en SSH depuis un Mac. Sa configuration et son accès constituent la première base de travail sous Linux dans le laboratoire.

<span id="diagnostic-reseau"></span>

## Diagnostic réseau : du symptôme à la résolution

### Symptôme

Le serveur Proxmox était relié en Ethernet à un répéteur Wi-Fi Free, lui-même connecté sans fil à la Freebox. Proxmox ne parvenait pas à joindre correctement sa passerelle réseau.

### Investigation

Les vérifications ont notamment porté sur ARP et sur des tests de connectivité afin d’examiner les échanges sur le réseau local et le chemin vers la passerelle. Aucune sortie de commande ni mesure précise n’est nécessaire pour expliquer le diagnostic.

### Cause identifiée

Le problème venait de la liaison ou de l’association du répéteur avec la Freebox, et non de la connexion Ethernet entre Proxmox et le répéteur.

### Résolution

La configuration du répéteur depuis l’application Freebox Connect a rétabli la connexion. La communication entre le Mac, Proxmox et le réseau local a ensuite fonctionné.

### Enseignements

Quand un chemin réseau passe par plusieurs liaisons, vérifier ARP et la connectivité de proche en proche aide à localiser le segment en cause. Un équipement peut être relié en Ethernet au répéteur sans que le lien Wi-Fi de remontée vers la Freebox soit correctement établi.

## Technologies et compétences mobilisées

Proxmox VE, Debian, Linux, virtualisation, réseau virtuel, DHCP et SSH. Les réalisations mobilisent l’installation d’un hyperviseur, la création d’une VM, son administration distante et l’observation de différents niveaux de connectivité réseau.

## Évolutions envisagées

L’hébergement du site statique avec Nginx, la mise en place d’un accès privé par VPN, l’automatisation et la supervision sont des pistes à réaliser et documenter. Elles ne sont pas présentées comme déjà installées.
