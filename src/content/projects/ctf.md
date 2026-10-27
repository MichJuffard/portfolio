---
title: "CTF · sécurité offensive"
summary: "Snowcrash, Rainfall et Override : ma découverte de la cybersécurité offensive, de l’investigation Linux à une meilleure compréhension de la mémoire et des binaires."
status: "terminé"
category: "École 42"
featured: false
tags: ["CTF", "Linux", "Analyse binaire", "Mémoire", "GDB"]
objective: "Découvrir la cybersécurité offensive par une progression de l’investigation Linux vers l’analyse des binaires et de la mémoire."
learnings: "Observer un environnement, vérifier une hypothèse et relier le comportement d’un programme à la mémoire et aux mécanismes Linux."
order: 4
---

## Trois projets, une progression

**Snowcrash, Rainfall et Override** constituent un même parcours d’apprentissage dans mon cursus : découvrir la cybersécurité offensive et mieux comprendre ce qui se passe derrière le comportement d’un programme.

L’objectif est d’apprendre à observer un environnement, repérer une hypothèse fragile et vérifier ce que le système ou le binaire fait réellement. Les notes du dépôt gardent une trace des analyses, des observations et du raisonnement suivi dans les challenges.

## Snowcrash : découvrir l’investigation

La première série m’a amené à explorer les permissions Linux, les programmes SUID, les variables d’environnement, les fichiers et les échanges réseau. Les ressources abordent notamment l’analyse d’une capture avec Wireshark et le comportement des programmes avec des outils de traçage.

Un point marquant est la différence entre **vérifier une condition** et **utiliser ensuite la ressource**. Le niveau consacré à une condition de concurrence TOCTOU montre que deux opérations séparées peuvent agir sur une situation qui a changé entre-temps.

## Rainfall : passer du code à la mémoire

Rainfall approfondit l’analyse des exécutables et de leur représentation décompilée. Les notes abordent les dépassements de buffer, les chaînes de format et la manipulation de données sur la **pile** et le **tas**, avec notamment GDB et Ghidra.

Cette étape rend les notions de C plus concrètes : une allocation a des limites, un pointeur désigne une zone et une copie trop longue peut modifier autre chose que la donnée prévue. Des exemples portent sur des allocations voisines et des pointeurs de fonction utilisés après une copie.

## Override : comprendre les détails qui changent tout

Override prolonge ce travail avec des analyses où les tailles, les entiers et les contrôles d’exécution prennent une place importante.

Les notes incluent notamment un cas d’**off-by-one** : une borne de boucle autorise une écriture supplémentaire qui affecte un champ voisin. Ce champ sert ensuite à déterminer une taille de copie. Un détail local peut donc modifier le comportement d’une opération ultérieure.

## Ce que j’en retiens sur la mémoire

- **Pile et tas :** distinguer les zones de stockage, leur rôle et les objets qu’elles contiennent.
- **Limites des buffers :** relier une taille allouée aux octets effectivement lus ou écrits.
- **Pointeurs et structures :** comprendre comment une donnée modifiée peut influencer un accès ou un appel ultérieur.
- **Tailles et entiers :** examiner les conversions et les bornes plutôt que se fier au nom d’une variable.
- **Flux d’exécution :** relier le code lu, les observations du débogueur et les décisions du programme.

La représentation mémoire dépend du programme, du compilateur et de l’environnement. L’intérêt de ces CTF est justement d’observer ces mécanismes, plutôt que d’appliquer une disposition supposée universelle.

## Une démarche réutilisable

Lire, formuler une hypothèse, observer, confronter les résultats et documenter : cette méthode dépasse les challenges. Elle renforce aussi ma compréhension du C, du débogage et de la gestion des ressources dans mes autres projets.

Cette série représente ma découverte de la sécurité offensive et une progression dans l’analyse des programmes. Les trois projets sont regroupés ici pour rendre ce fil conducteur visible.

## À propos du visuel

Le parcours interactif présente les thèmes des trois séries à partir des ressources du dépôt. Le modèle mémoire illustre une copie de taille variable dans un buffer et la modification éventuelle de champs voisins ; l’option de copie bornée montre la différence quand la capacité est respectée.

Cette disposition est pédagogique : elle ne reproduit ni un binaire précis ni un scénario d’exploitation. Le portfolio n’exécute aucun des programmes des challenges.
