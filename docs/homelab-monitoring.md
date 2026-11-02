# Métriques publiques du nœud Proxmox

## Fonctionnement opérationnel

Le widget de `/projets/homelab/` lit le JSON public [`/data/homelab-metrics.json`](https://mjuffard.fr/data/homelab-metrics.json). Le navigateur ne contacte que ce fichier statique ; il n’appelle jamais l’API Proxmox.

Un collecteur utilise l’API Proxmox pour produire le fichier destiné au widget et le transfère périodiquement vers OVHcloud. Le navigateur ne lit qu’un fichier statique ; il ne contacte jamais l’API Proxmox. Le portfolio reste en production indépendamment sur l’offre gratuite Free Hosting d’OVHcloud, incluse avec `mjuffard.fr` ; sa migration vers le homelab n’est ni planifiée ni prioritaire.

## Format du fichier public

Le fichier contient exactement ces quatre propriétés :

| Champ | Type et signification |
| --- | --- |
| `collected_at` | Chaîne ISO 8601 représentant l’horodatage UTC de collecte. |
| `cpu_percent` | Nombre fini de 0 à 100 : utilisation CPU du nœud. |
| `memory_percent` | Nombre fini de 0 à 100 : utilisation mémoire du nœud. |
| `storage_percent` | Nombre fini de 0 à 100 : utilisation de `rootfs` du nœud. |

Les champs manquants, supplémentaires, mal typés ou hors limites font rejeter toute la réponse. Aucun nom de machine, identifiant, adresse ou détail de service n’est nécessaire ni accepté.

`storage_percent` concerne uniquement le système de fichiers racine (`rootfs`) de Proxmox. Il ne représente pas l’ensemble des disques ni l’espace de stockage du homelab.

## Affichage et fraîcheur

- Le premier chargement client a lieu à l’initialisation du widget, puis une nouvelle requête est faite toutes les trois minutes avec le cache désactivé.
- Une mesure reste disponible jusqu’à 15 minutes après `collected_at`. À 15 minutes ou davantage, elle passe à l’état « Données périmées » ; les valeurs restantes sont explicitement marquées anciennes et les jauges sont masquées.
- Le composant programme aussi la transition de fraîcheur à partir de l’horodatage, même si la page reste ouverte entre deux rafraîchissements.
- Une date invalide ou située dans le futur, une réponse HTTP en erreur, un JSON malformé ou une erreur réseau affiche un état d’indisponibilité sans fabriquer de valeurs. Si une dernière mesure est conservée en mémoire, elle est présentée comme ancienne ou comme dernière mesure connue, jamais comme l’état actuel.
- La page Astro est générée statiquement. Le build ne télécharge pas le JSON et ne dépend donc ni du homelab ni de la disponibilité de l’endpoint. Sans JavaScript, le widget indique qu’aucune mesure n’a été reçue.

Le serveur Proxmox est actuellement volontairement éteint. OVHcloud continue de servir le portfolio et les fichiers JSON déjà publiés, mais les collectes ne sont pas renouvelées pendant cet arrêt. La dernière mesure peut donc être signalée comme ancienne ou indisponible par le widget, selon son horodatage et l’état de la requête.

Les barres sont des éléments HTML `<meter>` avec des libellés accessibles. Les changements de pourcentage et l’heure ne sont pas dans une région live ; le statut textuel n’est annoncé que lorsqu’il change.

## Périmètre du widget public

Ce widget affiche seulement les mesures CPU, mémoire et stockage système (`rootfs`) du nœud Proxmox publiées dans le dernier fichier reçu. Il ne présente pas l’état des services et n’est pas une plateforme complète d’observabilité. Ces données publiques restent distinctes de la supervision privée du homelab.

## Observabilité privée

Le homelab a été configuré avec Prometheus, PVE Exporter et Grafana OSS pour la supervision privée. PVE Exporter interroge l’API Proxmox en HTTPS avec validation du certificat et un jeton API en lecture seule. La configuration de Prometheus prévoit une collecte toutes les 60 secondes et sept jours de rétention. Prometheus et PVE Exporter écoutent localement ; Grafana reste privé et son accès administratif se fait par tunnel SSH. Le tableau de bord suit les ressources globales et par VM/LXC ainsi que les stockages `local` et `local-lvm`. Cette pile n’est pas nécessairement accessible en permanence : le serveur Proxmox est actuellement éteint.

Cette pile aide à comprendre et optimiser un hôte physique de 8 Go de RAM. Ses métriques détaillées ne sont pas publiées sur le site. Les composants Proxmox et Grafana ne sont pas interrogés par le navigateur.

Les tests de validation et de fraîcheur se lancent avec :

```sh
node --experimental-strip-types --test scripts/homelab-monitoring.test.mjs
```
