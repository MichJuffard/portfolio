---
title: "miniRT"
summary: "Un moteur de ray tracing en C : intersections, ombres et éclairage, enrichis de textures et de formes quadriques."
status: "terminé"
category: "École 42"
featured: false
tags: ["C", "MiniLibX", "Ray tracing", "Géométrie 3D"]
objective: "Produire une image depuis une scène décrite en fichier .rt en calculant les rayons, intersections, matériaux et lumières."
learnings: "Mettre en pratique les intersections et la géométrie 3D, l’éclairage et les ombres, puis les textures et formes quadriques de la version bonus."
order: 9
---

## Donner une couleur à chaque pixel

miniRT calcule une image à partir d’une scène décrite dans un fichier `.rt`. Pour chaque pixel, un rayon part de la caméra, rencontre les objets et retient la surface visible la plus proche. Sa couleur dépend ensuite du matériau, de la lumière et des obstacles entre cette surface et les sources lumineuses.

Le projet est écrit en **C**, avec **MiniLibX** pour l’affichage. Le dépôt sépare une version obligatoire et une version bonus ; le Makefile cible Linux avec les bibliothèques X11.

## De la scène à l’image

1. **Lire et valider la scène.** Le parsing traite la caméra, la lumière ambiante, les sources lumineuses et les paramètres des objets.
2. **Construire les rayons de caméra.** Le champ de vision et le rapport largeur/hauteur définissent leur direction. Le code utilise également des quaternions pour l’orientation de la caméra.
3. **Résoudre les intersections.** Les calculs géométriques identifient la surface la plus proche et sa normale.
4. **Calculer l’éclairage.** Dans la version bonus, les contributions ambiante, diffuse et spéculaire sont combinées. Un rayon vers chaque lumière permet de déterminer si la surface est dans l’ombre.
5. **Afficher le résultat.** L’image est calculée pixel par pixel puis présentée dans une fenêtre MiniLibX.

## Les extensions de la version bonus

Le code va au-delà des sphères, plans et cylindres : il contient aussi des intersections pour les **ellipsoïdes** et les **paraboloïdes elliptiques**.

Les matériaux sont décrits dans des fichiers `.mat` distincts. Ils permettent notamment de configurer la brillance, des textures XPM, des motifs procéduraux et des normal maps. Les conversions UV associent les surfaces géométriques aux textures ; le normal mapping modifie la normale utilisée pour l’éclairage afin de donner une impression de relief.

Le dépôt contient aussi des scènes sur un thème spatial, avec des matériaux et textures de planètes, ainsi que des motifs de damier et de rayures.

## Ce que le projet met en pratique

- **Mathématiques appliquées :** vecteurs, produits scalaires, normales, quaternions et équations d’intersection.
- **Programmation en C :** structures de données, allocation et libération des ressources, séparation du parsing, du calcul et de l’affichage.
- **Synthèse d’image :** visibilité, ombres, éclairage de type Phong, coordonnées UV et matériaux.
- **Architecture logicielle :** organisation de plusieurs primitives géométriques et de leurs fonctions de rendu.

## À propos du visuel interactif

Le visuel reprend la composition de **`scene/bonus/trophy.rt`**, présente dans la branche `origin/update-readme` du dépôt fourni : un paraboloïde forme la coupe, des cylindres composent la tige, le socle et les anses, un ellipsoïde dessine le pied et une petite sphère raccorde la coupe à sa tige.

Le cadrage, le sol et l’éclairage sont adaptés au portfolio. Les lumières colorées produisent des ombres distinctes, que l’on peut explorer avec les réglages. La scène est recalculée à la demande dans un worker, avec un aperçu de résolution réduite pendant le déplacement des lumières.

Cette interprétation web est indépendante du moteur C : elle reprend la composition géométrique, sans charger les fichiers `.rt` ni reproduire toutes les fonctionnalités du programme original.
