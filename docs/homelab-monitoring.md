# Métriques publiques du nœud Proxmox

## Fonctionnement opérationnel

Le widget de `/projets/homelab/` lit le JSON public [`/data/homelab-metrics.json`](https://mjuffard.fr/data/homelab-metrics.json). Le navigateur ne contacte que ce fichier statique ; il n’appelle jamais l’API Proxmox.

Le LXC `102 — monitoring` produit le fichier public destiné au widget et le transfère périodiquement par SFTP vers OVHcloud. L’implémentation actuellement documentée interroge l’API Proxmox en HTTPS avec validation TLS et un jeton limité à `Sys.Audit`. Un script shell utilise `curl` et `jq` pour calculer les trois pourcentages. Le portfolio demeure hébergé chez OVHcloud ; sa migration vers le homelab reste prévue.

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

## Périmètre du widget public

Ce widget affiche seulement les mesures courantes CPU, mémoire et stockage système (`rootfs`) du nœud Proxmox. Il ne présente pas l’état des services et n’est pas une plateforme complète d’observabilité. Ces données publiques sont distinctes de la supervision privée du LXC `103 — observability`.

## Observabilité privée

Le LXC `103 — observability` héberge Prometheus, PVE Exporter et Grafana OSS. PVE Exporter interroge l’API Proxmox en HTTPS en vérifiant le certificat TLS et au moyen d’un jeton API dédié en lecture seule. Prometheus collecte toutes les 60 secondes et conserve sept jours de données. Prometheus et PVE Exporter écoutent localement ; Grafana reste privé et son accès administratif se fait par tunnel SSH. Le tableau de bord suit les ressources globales et par VM/LXC ainsi que les stockages `local` et `local-lvm`.

Cette pile aide à comprendre et optimiser un hôte physique de 8 Go de RAM. Ses métriques détaillées ne sont pas publiées sur le site. Les composants Proxmox et Grafana ne sont pas interrogés par le navigateur.

Les tests de validation et de fraîcheur se lancent avec :

```sh
node --experimental-strip-types --test scripts/homelab-monitoring.test.mjs
```
