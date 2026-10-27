---
title: "Portfolio · conduite, CI/CD et exploitation"
summary: "Un site statique Astro hébergé sur OVHcloud : je pilote les besoins, l’architecture, la CI/CD et l’exploitation, avec Codex comme outil de développement."
status: "en cours"
category: "Personnel"
featured: true
featuredOrder: 4
featuredTitle: "Portfolio · conduite et exploitation"
featuredSummary: "Je définis le besoin, valide les choix et exploite le site ; Codex m’assiste dans le développement du code."
featuredTags: ["GitHub Actions", "SFTP", "OVHcloud"]
tags: ["Astro", "TypeScript", "GitHub Actions", "Gitleaks", "Python", "Paramiko", "SFTP"]
objective: "Publier un portfolio statique et comprendre chaque étape qui mène du dépôt GitHub au site accessible en HTTPS."
contribution: "Je pilote le projet : besoins, décisions d’architecture, CI/CD, hébergement, déploiement, validation et maintenance. Codex m’assiste pour produire et faire évoluer le code du site."
learnings: "Organiser des contrôles automatisés, transmettre le résultat du build avec un artefact et sécuriser un transfert SFTP par vérification de l’empreinte SSH et gestion des secrets."
order: 6
---

## Le besoin : publier et comprendre le parcours

Le portfolio est un site statique développé avec **Astro**, **TypeScript** et du CSS natif, hébergé chez OVHcloud. J’en définis les besoins et les objectifs, j’oriente les décisions techniques et valide les changements. **Codex m’assiste pour développer le code, les interfaces et les fonctionnalités** ; je ne présente pas ce code comme ayant été entièrement écrit par moi-même.

Je pilote aussi le parcours de livraison et d’exploitation, de la gestion du code à la mise en production. La chaîne de publication est un projet d’apprentissage que je conçois, comprends et maintiens moi-même.

## Les choix techniques

- **GitHub Actions** orchestre les contrôles, le build et le déploiement.
- **Gitleaks** recherche les secrets exposés dans le dépôt.
- Les tests et contrôles du projet précèdent la génération du site avec **Astro**.
- Un **artefact GitHub Actions** transmet les fichiers construits au job de déploiement.
- Un script **Python** utilisant **Paramiko** transfère les fichiers par **SFTP** vers l’hébergement OVHcloud.
- Le script vérifie l’empreinte SSH du serveur avant l’authentification. Les informations sensibles sont fournies par les secrets et variables GitHub Actions.

Le workflow de déploiement est déclenché manuellement avec `workflow_dispatch`. Le contrôle CI s’exécute aussi sur les pushes vers `main` et les pull requests ; le déploiement de production reste manuel.

## Implémentation et validation

La chaîne sépare les contrôles et la compilation du transfert des fichiers produits. Le déploiement consomme l’artefact du build, afin de publier le résultat déjà construit et validé plutôt que de reconstruire le site sur le serveur.

Un premier lancement manuel a abouti : le portfolio est publié sur [mjuffard.fr](https://mjuffard.fr), avec HTTPS opérationnel sur l’hébergement OVHcloud. Cela valide le parcours actuel jusqu’à la mise en ligne ; les améliorations listées plus bas restent à réaliser.

## Conduite, validation et exploitation

Je reste responsable du besoin, des choix d’architecture, de la configuration des workflows, de l’hébergement, du domaine, de la mise en production, des contrôles avant publication, de la sécurité et de la maintenance opérationnelle. Je valide les changements produits avec l’assistance de Codex et les résultats du build et du déploiement.

Le parcours m’amène à distinguer le succès d’un build de celui d’un déploiement réellement accessible. Le site est servi en HTTPS sur OVHcloud. Une supervision de disponibilité du site lui-même n’est pas encore en place ; le widget homelab affiche seulement un jeu limité de ressources Proxmox.

## État actuel et prochaines étapes

**Opérationnel :** le site statique est hébergé chez OVHcloud, le domaine est servi en HTTPS, les workflows GitHub Actions exécutent les contrôles et le build, et le premier déploiement SFTP manuel a réussi.

**À améliorer ou à réaliser :**

- déclencher le déploiement automatiquement après validation de la CI ;
- définir une suppression maîtrisée des anciens fichiers distants ;
- mettre en place un déploiement atomique et une stratégie de retour arrière ;
- migrer à court terme l’hébergement vers le homelab administré avec Proxmox ;
- mettre en place une vérification de disponibilité du portfolio, distincte du suivi des ressources du nœud Proxmox.

Le widget de la fiche homelab affiche désormais les mesures courantes CPU, mémoire et stockage rootfs du nœud Proxmox. Il ne vérifie pas la disponibilité du portfolio ni celle des services hébergés.
