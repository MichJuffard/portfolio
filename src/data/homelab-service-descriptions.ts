import type { HomelabService, HomelabServiceStatus, HomelabServiceView } from '../types/homelab-inventory';

interface ServiceDescription {
  displayName?: string;
  description: string;
  note?: string;
}

const descriptions: Record<string, ServiceDescription> = {
  'laboratoire d experimentation': {
    displayName: 'Laboratoire d’expérimentation',
    description: 'VM Debian Linux consacrée aux expérimentations Linux, Docker, à l’administration système et aux tests DevOps.',
    note: 'Démarrée à la demande pour limiter la consommation de ressources ; son état arrêté est normal en dehors des expérimentations.',
  },
  'acces distant securise': {
    description: 'Conteneur Alpine Linux exécutant WireGuard pour permettre un accès distant sécurisé à l’administration du homelab.',
    note: 'Le fonctionnement du conteneur ne confirme pas que le tunnel VPN a été testé de bout en bout.',
  },
  supervision: {
    description: 'Conteneur Alpine Linux qui collecte les métriques Proxmox et l’inventaire autorisé, puis publie les JSON filtrés sur OVHcloud.',
  },
};

const statusLabels: Record<HomelabServiceStatus, string> = {
  running: 'Actif',
  stopped: 'Arrêté',
  unknown: 'Inconnu',
};

function normalizeDescriptionKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, ' ')
    .toLocaleLowerCase('fr-FR')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getHomelabServiceViews(services: HomelabService[]): HomelabServiceView[] {
  return services.map(service => {
    const description = descriptions[normalizeDescriptionKey(service.name)];
    return {
      name: description?.displayName ?? service.name,
      type: service.type,
      typeLabel: service.type === 'vm' ? 'VM' : 'LXC',
      status: service.status,
      statusLabel: statusLabels[service.status],
      description: description?.description ?? 'Environnement public hébergé sur Proxmox ; son rôle n’est pas décrit ici.',
      note: description?.note,
    };
  });
}
