---
title: "Minishell"
summary: "Un shell Unix en C construit en binôme : ma contribution porte sur le moteur d’exécution, le parcours de l’arbre binaire, les processus, les pipes et les redirections."
status: "terminé"
category: "École 42"
featured: false
tags: ["C", "Unix", "Arbre binaire", "Processus", "Pipes"]
objective: "Construire en binôme un shell Unix qui exécute des commandes, avec opérateurs conditionnels, pipes et redirections."
contribution: "En binôme, j’ai développé le moteur d’exécution et le parcours de l’arbre ; mon binôme a pris en charge le parsing et la construction de l’arbre."
learnings: "Parcourir un arbre selon les statuts de retour, appliquer les redirections et coordonner les processus reliés par des pipes."
order: 8
---

## Ma contribution : faire vivre l’arbre

Ce projet a été réalisé en binôme. **Mon binôme a développé le parsing et la construction de l’arbre ; j’ai pris en charge l’exécution**, notamment le déplacement dans cet arbre et le traitement des différents types de nœuds.

Nous avons choisi cette architecture pour faciliter la prise en charge des opérateurs **`&&` et `||`**. L’exécution d’une commande produit un statut ; ce statut permet de décider quelle branche parcourir ensuite.

## Un arbre pour représenter la commande

La structure `t_tree` comporte les liens `left`, `right` et `root`, un type de nœud et les données associées. Les types distinguent commandes, opérateurs logiques, pipes et redirections, y compris l’ajout et les heredocs.

La fonction `exec_args` joue le rôle d’aiguilleur : elle sélectionne la fonction d’exécution correspondant au type du nœud. Chaque fonction traite sa responsabilité puis renvoie un statut à son appelant.

## Décider du chemin avec les statuts

Pour **`&&`**, `exec_and` commence par exécuter le sous-arbre gauche. Le sous-arbre droit est visité uniquement si le statut obtenu vaut zéro.

Pour **`||`**, `exec_or` exécute également la gauche en premier. Il visite la droite en cas de statut non nul, avec un traitement particulier pour éviter de poursuivre après une interruption SIGINT.

Par exemple, avec `return 1 && echo ok || echo secours`, la première commande échoue : `echo ok` est ignoré, puis la branche de secours de `||` est exécutée. Le court-circuit fait partie de la logique du parcours ; la branche ignorée reste présente dans l’arbre.

## Relier les processus avec les pipes

Le code de `exec_pipe` crée un pipe et des processus avec `fork`. Une branche écrit vers le pipe et l’autre reçoit son contenu en entrée. Les descripteurs utiles sont transmis au parcours du sous-arbre concerné, puis les extrémités inutiles sont fermées.

Le parent attend les processus. Le statut de la branche droite détermine le résultat du pipeline, qui peut à son tour servir à la décision d’un opérateur logique.

## Appliquer les redirections et exécuter les commandes

Les fonctions de redirection préparent les fichiers et les descripteurs avant de descendre vers la commande. Le code distingue lecture, écriture avec remplacement, ajout et heredoc.

L’exécution d’une commande distingue les commandes internes du shell des programmes externes. Les fonctions dédiées gèrent notamment la recherche dans le PATH, les appels système d’exécution, les statuts et le nettoyage des ressources. Le projet inclut aussi la gestion des signaux, de l’environnement et de l’expansion.

## Compétences mises en pratique

- Traduire un arbre de syntaxe en décisions d’exécution récursives.
- Propager les statuts et implémenter le court-circuit des opérateurs logiques.
- Organiser les processus et les communications par pipes.
- Gérer les descripteurs, redirections, fermetures et ressources.
- Travailler avec une interface commune entre le parsing du binôme et mon moteur d’exécution.

## Utiliser l’explorateur

Saisissez une commande ou choisissez un exemple. L’arbre se construit, puis les boutons permettent d’avancer, de revenir sur une étape ou d’afficher le résultat final. Les branches ignorées restent visibles, les nœuds terminés affichent leur statut et les fichiers virtuels montrent l’effet des redirections.

Il s’agit d’un **interpréteur pédagogique indépendant**, avec un sous-ensemble de commandes et de règles shell. Les pipes sont illustrés dans un ordre séquentiel pour rendre le flux de données lisible ; le programme C utilise des processus distincts. Aucun programme n’est lancé sur la machine du visiteur et les fichiers restent en mémoire dans la démo.
