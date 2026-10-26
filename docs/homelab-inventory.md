# Inventaire public des environnements Proxmox

La fiche homelab lit le fichier statique [`/data/homelab-inventory.json`](https://mjuffard.fr/data/homelab-inventory.json). Elle n’appelle aucune API Proxmox. Un collecteur privé filtre les environnements marqués `portfolio-public`, retire les métadonnées internes et publie le JSON sur l’hébergement OVHcloud.

## Politique de publication

Le homelab est privé par défaut. Seule une décision explicite matérialisée par le tag Proxmox `portfolio-public` autorise le collecteur à inclure une VM ou un LXC. Le navigateur ne choisit pas les environnements publiés. Les modifications du collecteur et de l’infrastructure ne font pas partie du frontend.

Le contrat public contient exclusivement :

```ts
interface HomelabInventory {
  collected_at: string; // ISO 8601 en UTC
  services: Array<{
    name: string;
    type: 'vm' | 'lxc';
    status: 'running' | 'stopped' | 'unknown';
  }>;
}
```

Les objets avec des champs supplémentaires ou manquants sont rejetés. Un nom est inséré dans le DOM comme texte, jamais comme HTML. Un statut inattendu est ramené à « Inconnu ». Les noms identiques restent des entrées distinctes ; aucun identifiant Proxmox n’est supposé.

## Affichage et actualisation

La page statique ne charge pas le JSON pendant la génération Astro. À l’ouverture dans un navigateur, le composant demande `/data/homelab-inventory.json` avec `cache: "no-store"`, puis relit le fichier toutes les trois minutes. Les requêtes sont séquentielles, interrompues après dix secondes et leurs minuteries sont nettoyées lors du changement ou de la fermeture de page.

Le seuil de péremption est de quinze minutes après `collected_at`. Il est surveillé même si la page reste ouverte. Pour des données périmées, la dernière liste peut rester visible avec un avertissement ; tous les états sont libellés « État non vérifié » avec leur dernière valeur, et la liste ne confirme pas les autorisations actuelles. Après une erreur de lecture, la dernière liste connue peut rester visible mais son état et son autorisation actuelle sont indiqués comme non vérifiés. Un inventaire valide vide supprime toutes les cartes. Aucune donnée d’exemple n’est utilisée comme remplacement.

Un horodatage dans le futur produit un message d’incohérence. Un endpoint inaccessible ou un JSON invalide produit « Architecture temporairement indisponible ». Le reste de la page reste fonctionnel dans tous ces cas.

Les nouvelles entrées `vm` ou `lxc` produisent automatiquement une carte avec le nom public, le type et l’état. Des descriptions pédagogiques complémentaires peuvent être ajoutées dans `src/data/homelab-service-descriptions.ts`, mais elles ne contrôlent pas la découverte ni l’apparition des cartes.

Le schéma ne représente que la relation logique Proxmox → environnements hébergés. Il ne montre ni connexions réseau, ni segments, ni règles de routage. Le widget des ressources est indépendant de l’inventaire : un état Proxmox `running` n’établit pas la disponibilité d’une application et ne valide pas le tunnel VPN de bout en bout.

## Vérification

```sh
node --experimental-strip-types --test scripts/homelab-inventory.test.mjs
```
