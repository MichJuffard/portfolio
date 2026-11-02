# Inventaire public des environnements Proxmox

La fiche homelab lit le fichier statique [`/data/homelab-inventory.json`](https://mjuffard.fr/data/homelab-inventory.json), hébergé sur OVHcloud avec le portfolio. Le collecteur utilise l’API Proxmox pour le produire et le transférer périodiquement. Le navigateur ne contacte ni l’API Proxmox ni les VM/LXC.

## Politique de publication

Le homelab est privé par défaut. Le producteur sélectionne **uniquement** les VM et LXC portant le tag Proxmox `portfolio-public`. L’ajout ou le retrait de ce tag reste le mécanisme d’autorisation de publication ; l’interface web ne décide jamais quels environnements doivent être publics. Les descriptions d’affichage viennent d’un catalogue éditorial et non des descriptions internes Proxmox.

Les noms et descriptions sont des champs éditoriaux maintenus par le producteur au moment où un environnement est autorisé. Ne pas reprendre automatiquement la description interne de Proxmox : elle peut contenir des informations opérationnelles privées. N’inclure aucun jeton API, identifiant d’authentification, adresse IP interne, configuration VPN ou secret.

## Exemple de contrat public enrichi

Cet exemple illustre le format attendu ; il ne représente pas l’état actuel du homelab.

```json
{
  "collected_at": "2026-10-27T12:00:00Z",
  "services": [
    {
      "id": "lxc/103",
      "name": "Observabilité",
      "description": "Supervision des ressources du homelab avec Prometheus et Grafana.",
      "type": "lxc",
      "status": "running"
    }
  ]
}
```

Le frontend autorise seulement les propriétés racine `collected_at` et `services`, et les propriétés de service suivantes :

| Champ | Type | Règle |
| --- | --- | --- |
| `id` | chaîne | `qemu/<id>` (format Proxmox) ou `vm/<id>` (compatibilité) pour `type: vm` ; `lxc/<id>` pour `type: lxc`. |
| `name` | chaîne | Nom d’affichage public, limité à 80 caractères. |
| `description` | chaîne | Description publique choisie, limitée à 280 caractères. |
| `type` | `vm` ou `lxc` | Obligatoire. |
| `status` | `running`, `stopped` ou `unknown` | Une valeur manquante ou non reconnue est affichée « Inconnu ». |

Les nouvelles entrées fournissent les cinq champs du contrat enrichi. Pour compatibilité avec d’anciens fichiers, le frontend accepte aussi les objets sans `id` ni `description`, ainsi que des champs `name` ou `description` manquants. Il fournit alors « Service public sans nom · VM/LXC » ou « Aucune description publique n’a été fournie. » sans déduire le rôle du service. Un `id` présent est validé mais n’est pas affiché dans les cartes.

Les propriétés supplémentaires sont rejetées ; aucun champ d’inventaire interne n’est rendu. Les noms et descriptions sont insérés dans le DOM comme texte, jamais comme HTML. Cette validation protège l’affichage, mais le producteur doit toujours filtrer les machines et rédiger une liste explicite de données publiques avant de publier le fichier.

## Collecte et publication

Le collecteur publie un inventaire filtré par le tag `portfolio-public`, enrichi des noms et descriptions du catalogue et limité au contrat public décrit ci-dessus. Le frontend conserve une compatibilité avec les objets plus anciens sans `id` ni `description`. Il ne faut pas exposer une API de Proxmox au navigateur.

## Affichage et actualisation

La génération Astro est statique et ne télécharge pas le JSON. Dans le navigateur, le composant demande `/data/homelab-inventory.json` avec `cache: "no-store"` et relit le fichier toutes les trois minutes. Les requêtes sont séquentielles, interrompues après dix secondes et nettoyées au changement ou à la fermeture de page.

Le seuil de péremption est de quinze minutes après `collected_at`. Pour des données périmées ou après une erreur, la dernière liste peut rester visible, mais ses états deviennent non vérifiés. Un horodatage futur signale une incohérence. Un inventaire valide vide supprime les cartes. Aucun exemple codé en dur n’est utilisé comme remplacement.

Le serveur Proxmox est actuellement volontairement éteint. Le portfolio reste accessible chez OVHcloud, mais les collectes ne sont pas renouvelées pendant cet arrêt : le fichier conserve la dernière collecte et l’interface la signale comme ancienne selon son horodatage.

« Actif » indique uniquement que Proxmox a rapporté `running` lors de la collecte. Cela ne démontre ni la disponibilité d’une application ni le bon fonctionnement de WireGuard.

## Vérification

```sh
node --experimental-strip-types --test scripts/homelab-inventory.test.mjs
```
