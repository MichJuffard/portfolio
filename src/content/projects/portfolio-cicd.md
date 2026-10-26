---
title: "Portfolio et chaîne CI/CD"
summary: "Du besoin de publier un portfolio Astro à un premier déploiement manuel réussi sur OVHcloud : une démarche d’apprentissage DevOps autour des contrôles, du build et du transfert SFTP."
status: "en cours"
category: "Personnel"
featured: false
tags: ["Astro", "TypeScript", "GitHub Actions", "Gitleaks", "Python", "Paramiko", "SFTP"]
objective: "Publier un portfolio statique et comprendre chaque étape qui mène du dépôt GitHub au site accessible en HTTPS."
contribution: "J’ai conçu et maintiens la chaîne GitHub Actions ainsi que le déploiement SFTP. Le premier lancement manuel via workflow_dispatch a réussi."
learnings: "Organiser des contrôles automatisés, transmettre le résultat du build avec un artefact et sécuriser un transfert SFTP par vérification de l’empreinte SSH et gestion des secrets."
order: 0
---

## Le besoin : publier et comprendre le parcours

Le portfolio est un site statique développé avec **Astro**, **TypeScript** et du CSS natif. Je voulais le publier sur mon domaine tout en apprenant à suivre le trajet complet entre le code versionné sur GitHub et les fichiers servis au public.

Le choix d’une chaîne CI/CD me permet de rendre les vérifications et la publication répétables, et de comprendre les contrôles nécessaires avant de transférer un nouveau build.

## Les choix techniques

- **GitHub Actions** orchestre les contrôles, le build et le déploiement.
- **Gitleaks** recherche les secrets exposés dans le dépôt.
- Les tests et contrôles du projet précèdent la génération du site avec **Astro**.
- Un **artefact GitHub Actions** transmet les fichiers construits au job de déploiement.
- Un script **Python** utilisant **Paramiko** transfère les fichiers par **SFTP** vers l’hébergement OVHcloud.
- Le script vérifie l’empreinte SSH du serveur avant l’authentification. Les informations sensibles sont fournies par les secrets et variables GitHub Actions.

Le workflow de déploiement est déclenché manuellement avec `workflow_dispatch`. Il n’est pas lancé automatiquement à chaque push.

## Implémentation et validation

La chaîne sépare les contrôles et la compilation du transfert des fichiers produits. Le déploiement consomme l’artefact du build, afin de publier le résultat déjà construit et validé plutôt que de reconstruire le site sur le serveur.

Un premier lancement manuel a abouti : le portfolio est publié sur [mjuffard.fr](https://mjuffard.fr), avec HTTPS opérationnel sur l’hébergement OVHcloud. Cela valide le parcours actuel jusqu’à la mise en ligne ; les améliorations listées plus bas restent à réaliser.

## Ce que cette mise en place m’apprend

Ce projet me fait travailler les étapes d’une livraison : protéger les informations sensibles, exécuter les vérifications, produire un résultat identifiable, le transmettre entre jobs, puis l’installer sur un serveur distant. Il m’oblige aussi à distinguer le succès d’un build de celui d’un déploiement réellement accessible.

## État actuel et prochaines étapes

**Opérationnel :** le site statique est hébergé chez OVHcloud, le domaine est servi en HTTPS, les workflows GitHub Actions exécutent les contrôles et le build, et le premier déploiement SFTP manuel a réussi.

**À améliorer ou à réaliser :**

- déclencher le déploiement automatiquement après validation de la CI ;
- définir une suppression maîtrisée des anciens fichiers distants ;
- mettre en place un déploiement atomique et une stratégie de retour arrière ;
- migrer à court terme l’hébergement vers le homelab administré avec Proxmox ;
- mettre en place une vérification de disponibilité du portfolio, distincte du suivi des ressources du nœud Proxmox.

Le widget de la fiche homelab affiche désormais les mesures courantes CPU, mémoire et stockage rootfs du nœud Proxmox. Il ne vérifie pas la disponibilité du portfolio ni celle des services hébergés.
