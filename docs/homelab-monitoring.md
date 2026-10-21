# Format public des métriques du homelab

## État actuel

Le widget de `/projets/homelab/` utilise des valeurs de démonstration fabriquées. Elles sont signalées comme fictives, y compris leur horodatage. Aucun endpoint n’est configuré et le navigateur ne fait aucune requête réseau dans cette configuration.

Le composant Astro, les types, la validation et la source de démonstration sont séparés :

- `src/components/HomelabMonitoring.astro` affiche le tableau de bord et gère son éventuel rafraîchissement client ;
- `src/types/homelab-monitoring.ts` définit le format TypeScript ;
- `src/lib/homelab-monitoring.ts` valide le JSON et détermine l’état selon l’âge des données ;
- `src/data/homelab-monitoring-demo.ts` fournit l’échantillon fictif.

Le champ optionnel `PUBLIC_HOMELAB_METRICS_URL` permettrait plus tard de configurer l’URL d’un JSON public en lecture seule. Il n’est pas défini pour cette version. Cette variable ne doit contenir ni secret, ni URL Proxmox, ni adresse de service privé. Le code accepte une URL HTTPS vers un fichier `.json` public ou un chemin `.json` relatif à l’origine ; il rejette HTTP, les adresses privées évidentes, les identifiants et les paramètres de requête. Le nom DNS devra tout de même être vérifié avant publication, car le build statique ne peut pas connaître sa résolution réseau.

## Schéma version 1

```json
{
  "schemaVersion": 1,
  "measuredAt": "2026-10-21T08:30:00.000Z",
  "scope": "proxmox-host",
  "metrics": {
    "cpuPercent": 18.4,
    "memoryPercent": 62.1,
    "storagePercent": 41.7
  }
}
```

Cet exemple est fictif et ne décrit pas l’état réel du homelab.

| Champ | Format | Règle |
| --- | --- | --- |
| `schemaVersion` | entier | Valeur `1` pour ce schéma. |
| `measuredAt` | chaîne ISO 8601 UTC | Horodatage UTC avec millisecondes, par exemple `2026-10-21T08:30:00.000Z`. |
| `scope` | `proxmox-host` ou `vm` | Un seul périmètre par document. L’interface affiche « Hôte Proxmox » ou « Machine virtuelle (sans nom) ». |
| `metrics.cpuPercent` | nombre ou `null` | Pourcentage entre 0 et 100. |
| `metrics.memoryPercent` | nombre ou `null` | Pourcentage entre 0 et 100. |
| `metrics.storagePercent` | nombre ou `null` | Pourcentage entre 0 et 100. |

Une métrique absente ou `null` s’affiche comme indisponible, jamais comme zéro. Si aucune métrique n’est exploitable, l’état global est « Indisponible ». Les champs inconnus sont rejetés afin que le format reste strict et minimal. Les métriques d’un document doivent toutes provenir du périmètre indiqué ; ne pas mélanger un hôte et une VM dans le même objet.

Le collecteur doit utiliser des dénominateurs cohérents pour les pourcentages : CPU relativement à la capacité du périmètre, mémoire utilisée sur la mémoire disponible et stockage utilisé sur une capacité explicitement choisie. Pour une VM, les trois métriques doivent décrire la même VM, sans inclure son identifiant. Si une mesure n’a pas de définition stable ou ne peut pas être collectée, elle doit être omise ou transmise comme `null`.

## États et rafraîchissement

- **Démo** : échantillon fictif fourni par le site, clairement signalé.
- **Disponible** : JSON valide, avec au moins une métrique et une mesure vieille de dix minutes au plus.
- **Données anciennes** : JSON valide, mais mesure plus vieille que dix minutes.
- **Indisponible** : récupération impossible sans mesure valide exploitable en cache, ou mesure reçue sans métrique exploitable. Si la dernière mesure valide en cache est trop ancienne, l’état reste « Données anciennes » et la note signale l’échec de l’actualisation.

Le rafraîchissement prévu est de trois minutes. Une erreur de récupération ne signifie pas que l’homelab est hors ligne. Lorsque JavaScript est désactivé, l’échantillon de démonstration reste affiché ; pour une source réelle, la page indique qu’aucune mesure n’a été chargée plutôt que de montrer des valeurs inventées. Une source d’un autre domaine devra autoriser en CORS la lecture par le portfolio.

Le test du schéma et des états se lance avec :

```sh
node --experimental-strip-types --test scripts/homelab-monitoring.test.mjs
```

## Publication et confidentialité

Une évolution possible consiste à faire lire les métriques autorisées par un collecteur interne, à les filtrer et à les agréger, puis à publier ce JSON minimal par une connexion sortante authentifiée. Les identifiants de publication restent sur le collecteur et ne sont jamais intégrés au portfolio. Le navigateur ne doit contacter que cette source publique, jamais Proxmox, Prometheus ou un service privé.

Le JSON ne doit contenir aucun nom interne, adresse IP, port, utilisateur, identifiant de VM, détail de topologie, journal système, état de service personnel ou donnée du cloud familial. Le champ `scope` est volontairement limité à une catégorie générale et aucun identifiant de machine n’est accepté.

Le portfolio et le homelab peuvent être hébergés sur la même VM. Dans ce cas, une panne de cette VM rend aussi le portfolio inaccessible ; le widget ne peut pas en informer les visiteurs. Un hébergement externe du portfolio et une publication indépendante des métriques pourraient réduire cette dépendance, sans garantir que le collecteur ou la publication fonctionne. Les données anciennes indiquent seulement la date de la dernière mesure reçue, jamais l’état en ligne ou hors ligne de l’infrastructure.

Le widget se désactive via `monitoringEnabled: false` dans la fiche homelab. Le texte `monitoringFallback` fournit alors une courte présentation statique. Aucun service externe, collecteur ni surveillance active n’est installé dans cette version.
