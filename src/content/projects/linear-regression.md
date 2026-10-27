---
title: "Linear regression"
summary: "Une régression linéaire en Python pour estimer un prix selon le kilométrage : normalisation des données, descente de gradient, prédiction et évaluation avec RMSE et R²."
status: "terminé"
category: "École 42"
featured: false
tags: ["Python", "NumPy", "Matplotlib", "Descente de gradient"]
objective: "Estimer un prix à partir du kilométrage avec un modèle linéaire appris sur les données du projet."
learnings: "Normaliser une variable, entraîner les paramètres par descente de gradient et évaluer l’ajustement avec RMSE et R²."
order: 10
---

## Relier des données à une estimation

Le projet utilise un jeu de **24 observations**, chacune associant un kilométrage à un prix. L’objectif est d’apprendre une relation linéaire pour estimer un prix à partir d’un nouveau kilométrage.

L’implémentation est écrite en **Python**, avec **NumPy** pour les calculs numériques et **Matplotlib** pour les graphiques. Le dépôt distingue les opérations d’entraînement, de prédiction, d’affichage et d’évaluation dans des scripts séparés.

## Préparer les données

Le fichier CSV est chargé en deux séries : kilométrage et prix. Le kilométrage est normalisé par une transformation **min-max** :

`x = (km − km_min) / (km_max − km_min)`

Les observations d’entraînement sont ainsi ramenées sur un intervalle de 0 à 1. Le prix conserve son échelle d’origine. Les bornes de normalisation sont gardées avec les paramètres du modèle pour appliquer la même transformation lors d’une prédiction.

## Apprendre par descente de gradient

Le modèle calcule `prix_estimé = θ₀ + θ₁ × x`. Les deux paramètres commencent à zéro.

À chaque itération, le programme calcule les estimations puis leur écart aux prix observés. La moyenne des erreurs donne le gradient de θ₀ ; la moyenne des erreurs multipliées par x donne celui de θ₁. Le taux d’apprentissage détermine l’amplitude de la mise à jour.

Le code permet de choisir le nombre maximal d’itérations, le taux d’apprentissage et un seuil d’arrêt basé sur la variation de l’erreur quadratique moyenne. Les valeurs proposées par défaut sont **10 000 itérations**, un taux de **0,01** et un seuil de **10⁻⁶**.

## Taux d’apprentissage : vitesse et convergence

Un taux plus faible produit des mises à jour plus petites. Avec un budget fixé à 10 000 itérations, le modèle peut donc rester loin de son meilleur ajustement : il faut lui laisser davantage d’itérations.

**Un petit taux ne garantit toutefois pas une meilleure précision finale.** Pour cette régression linéaire à erreur quadratique, les paramètres minimisent une fonction convexe. Avec des taux stables et assez d’itérations, ils peuvent se rapprocher de la même solution. Un taux trop grand peut, au contraire, provoquer des oscillations ou une divergence ; les trois taux proposés dans l’explorateur sont stables sur ces données normalisées.

La démo propose désormais un budget allant jusqu’à **300 000 itérations**, au lieu de reprendre seulement le budget par défaut du script Python. Le tableau compare les erreurs après 10 000 itérations et à l’arrêt : le taux 0,001 progresse plus lentement, mais rejoint ensuite un RMSE presque identique à celui des taux 0,01 et 0,1.

Le message d’état distingue deux situations : le budget est épuisé, ou la variation de MSE est passée sous le seuil d’arrêt. Ce critère dépend lui-même de la taille des pas : une variation faible ne prouve pas que les paramètres sont exactement au minimum. Enfin, prolonger l’apprentissage ne supprime pas la dispersion des observations autour d’une droite.

## Sauvegarder et réutiliser le modèle

Après l’entraînement, le programme peut enregistrer θ₀, θ₁ et les bornes du kilométrage dans un fichier CSV. Le script de prédiction recharge ces valeurs et normalise le kilométrage saisi avant de calculer l’estimation.

D’autres scripts permettent d’afficher la droite avec les observations et de recalculer les indicateurs à partir d’un modèle enregistré.

## Évaluer l’ajustement

Deux indicateurs sont implémentés :

- **RMSE** : racine de l’erreur quadratique moyenne, exprimée dans l’unité des prix.
- **R²** : coefficient de détermination, qui compare les erreurs du modèle à la dispersion des prix autour de leur moyenne.

Ces mesures sont calculées sur le jeu fourni. Elles renseignent sur l’ajustement à ces observations ; elles ne constituent pas une évaluation sur un jeu de test distinct. De même, une estimation en dehors de la plage des kilométrages observés est une extrapolation.

## Compétences mises en pratique

- Préparer et normaliser des données numériques.
- Implémenter une descente de gradient et comprendre le rôle de ses paramètres.
- Séparer entraînement, sauvegarde, prédiction et évaluation.
- Interpréter une droite ajustée, ses résidus et ses indicateurs.
- Relier une formule mathématique à des calculs vectorisés et à leur visualisation.

## Explorer le modèle dans le portfolio

Le graphique reprend les 24 observations du CSV du projet. Le curseur d’apprentissage permet de revenir au modèle initial puis de suivre les mises à jour ; le taux choisi modifie la vitesse de progression. Les écarts verticaux montrent la différence entre les observations et les estimations de la droite.

Le modèle web est une réimplémentation indépendante de la méthode Python. Il conserve la normalisation du seul kilométrage et la même règle de convergence. Les estimations et les métriques sont recalculées dans le navigateur ; aucun serveur Python n’est nécessaire.
