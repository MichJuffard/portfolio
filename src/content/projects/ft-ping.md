---
title: "ft_ping"
summary: "Projet en cours en C : explorer ICMP, construire les paquets Echo et préparer le suivi des réponses et des délais."
status: "en cours"
category: "École 42"
featured: false
tags: ["C", "IPv4", "ICMP", "Sockets raw"]
objective: "Reproduire le principe de ping : construire un Echo Request ICMP, reconnaître les réponses et mesurer le temps d’aller-retour."
learnings: "Structures ICMP, sockets raw, checksum, lecture des réponses et suivi des délais ; l’intégration du cycle complet reste en cours."
order: 5
---

## Comprendre un outil de diagnostic réseau

L’objectif de ft_ping est de reproduire le principe de ping : construire un **ICMP Echo Request**, l’envoyer vers une cible, reconnaître les réponses et mesurer le temps d’aller-retour, ou **RTT**.

Le projet est **en cours**. Le travail réalisé porte sur les notions réseau, la structure des messages et les composants nécessaires à la logique d’envoi, de réception et de suivi. Il ne s’agit pas encore d’un outil finalisé.

## Les bases présentes dans le code

- **Résolution IPv4 :** utilisation de `getaddrinfo` pour obtenir l’adresse de la destination.
- **Socket raw :** création d’une socket `AF_INET`, `SOCK_RAW`, `IPPROTO_ICMP`, avec un réglage du TTL prévu par `setsockopt`.
- **Construction des messages :** encodage du type, du code, de l’identifiant et du numéro de séquence ; fonctions de conversion des entiers de 16 bits en ordre réseau.
- **Checksum :** routine de somme de contrôle ICMP et intégration dans la construction du message.
- **Lecture des réponses :** fonction de reconnaissance du type Echo Reply et utilitaires d’inspection des champs IPv4 et ICMP.
- **Suivi des paquets :** liste chaînée contenant les séquences et les heures d’envoi, avec ajout, recherche par séquence et suppression.
- **Temps et options :** fonctions de manipulation des délais et parsing d’options comme le nombre de paquets, l’intervalle, la taille et le TTL.

Ces composants matérialisent la logique métier : identifier chaque requête, conserver son instant d’envoi, retrouver sa réponse et distinguer une réponse reçue d’une expiration du délai.

## Comprendre ce que dit une réponse

Un Echo Reply reprend l’identifiant et la séquence de la requête. Le rapprochement avec le paquet suivi permet de calculer un RTT à partir de l’heure d’envoi et de celle de réception.

L’absence de réponse exige une interprétation prudente : une perte de paquet ou un filtrage ICMP peuvent produire le même symptôme qu’une cible indisponible. Ping renseigne sur les échanges ICMP ; il ne valide pas, à lui seul, le fonctionnement d’une application web.

## Consolidation en cours

L’intégration du cycle complet d’envoi et de réception reste en cours : attente des événements, envoi et réception des messages, puis expiration des paquets suivis.

Les prochaines étapes sont d’intégrer cette boucle, de valider le calcul du checksum selon les tailles de message, de rapprocher les réponses des requêtes attendues et de consolider les mesures de RTT et les statistiques.

## Compétences mises en pratique

Programmation réseau en C, représentation binaire des protocoles, ordre des octets, gestion des ressources et organisation d’un suivi de requêtes avec délais. Le projet permet de relier un outil familier aux échanges qui se déroulent réellement sur le réseau.

## À propos du visuel

Le schéma et l’explorateur illustrent le fonctionnement visé, avec un cas de réponse et un cas d’expiration. Aucun paquet n’est envoyé depuis le portfolio et les valeurs affichées ne sont pas des résultats de test du programme C.
