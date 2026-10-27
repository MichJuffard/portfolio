# Inventaire public des environnements Proxmox

La fiche homelab lit le fichier statique [`/data/homelab-inventory.json`](https://mjuffard.fr/data/homelab-inventory.json). Le navigateur ne contacte ni l’API Proxmox ni les LXC. Le fichier est produit et transféré périodiquement par le LXC `102 — monitoring` vers l’hébergement OVHcloud.

## Politique de publication

Le homelab est privé par défaut. Le producteur doit sélectionner **uniquement** les VM et LXC portant le tag Proxmox `portfolio-public`. L’ajout ou le retrait de ce tag reste le mécanisme d’autorisation de publication ; l’interface web ne décide jamais quels environnements doivent être publics.

Les noms et descriptions sont des champs éditoriaux maintenus par le producteur au moment où un environnement est autorisé. Ne pas reprendre automatiquement la description interne de Proxmox : elle peut contenir des informations opérationnelles privées. N’inclure aucun jeton API, identifiant d’authentification, adresse IP interne, configuration VPN ou secret.

## Contrat public enrichi

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

Les machines doivent fournir les cinq champs du contrat enrichi. Pendant la transition, le frontend accepte les anciens objets sans `id` ni `description`, ainsi que des champs `name` ou `description` manquants. Il fournit alors « Service public sans nom · VM/LXC » ou « Aucune description publique n’a été fournie. » sans déduire le rôle du service. Un `id` présent est validé mais n’est pas affiché dans les cartes.

Les propriétés supplémentaires sont rejetées ; aucun champ d’inventaire interne n’est rendu. Les noms et descriptions sont insérés dans le DOM comme texte, jamais comme HTML. Cette validation protège l’affichage, mais le producteur doit toujours filtrer les machines et rédiger une liste explicite de données publiques avant de publier le fichier.

## Transition du producteur

Le générateur JSON du LXC 102 ne se trouve pas dans ce dépôt et n’a pas été modifié dans le cadre de cette évolution. Le contrat est prêt côté frontend, mais les nouveaux noms et descriptions ne seront visibles qu’après mise à jour et validation du producteur. L’ancienne forme reste affichable pendant ce travail, avec une description neutre.

Lors de l’évolution du producteur, conserver l’autorisation par tag `portfolio-public`, associer les champs éditoriaux à l’identifiant stable de la VM/LXC, filtrer explicitement les clés publiées et garder les deux fichiers JSON statiques. Ne pas exposer une API de Proxmox au navigateur.

## Affichage et actualisation

La génération Astro est statique et ne télécharge pas le JSON. Dans le navigateur, le composant demande `/data/homelab-inventory.json` avec `cache: "no-store"` et relit le fichier toutes les trois minutes. Les requêtes sont séquentielles, interrompues après dix secondes et nettoyées au changement ou à la fermeture de page.

Le seuil de péremption est de quinze minutes après `collected_at`. Pour des données périmées ou après une erreur, la dernière liste peut rester visible, mais ses états deviennent non vérifiés. Un horodatage futur signale une incohérence. Un inventaire valide vide supprime les cartes. Aucun exemple codé en dur n’est utilisé comme remplacement.

« Actif » indique uniquement que Proxmox a rapporté `running` lors de la collecte. Cela ne démontre ni la disponibilité d’une application ni le bon fonctionnement de WireGuard.

## Vérification

```sh
node --experimental-strip-types --test scripts/homelab-inventory.test.mjs
```
