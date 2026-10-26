# Monitoring courant du nœud Proxmox

## Fonctionnement opérationnel

Le widget de `/projets/homelab/` lit le JSON public [`/data/homelab-metrics.json`](https://mjuffard.fr/data/homelab-metrics.json). Le navigateur ne contacte que ce fichier statique ; il n’appelle jamais l’API Proxmox.

Un LXC dédié sous Alpine Linux 3.23 interroge l’API Proxmox en HTTPS avec validation du certificat TLS et un jeton limité à `Sys.Audit`. Un script shell utilise `curl` et `jq` pour calculer les trois pourcentages. Une tâche cron collecte et publie le fichier toutes les trois minutes par SFTP vers l’hébergement OVHcloud. Le portfolio demeure hébergé chez OVHcloud ; la migration du site vers le homelab reste prévue.

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

Les barres sont des éléments HTML `<meter>` avec des libellés accessibles. Les changements de pourcentage et l’heure ne sont pas dans une région live ; le statut textuel n’est annoncé que lorsqu’il change.

## Périmètre

Ce système affiche seulement les mesures courantes CPU, mémoire et stockage système du nœud Proxmox. Il n’y a pas de Prometheus, Grafana, stockage historique ou système d’alertes installé. Ce widget ne présente donc pas l’état des services et n’est pas une plateforme complète d’observabilité.

Les tests de validation et de fraîcheur se lancent avec :

```sh
node --experimental-strip-types --test scripts/homelab-monitoring.test.mjs
```
