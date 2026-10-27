import type { HomelabService, HomelabServiceStatus, HomelabServiceView } from '../types/homelab-inventory';

const statusLabels: Record<HomelabServiceStatus, string> = {
  running: 'Actif',
  stopped: 'Arrêté',
  unknown: 'Inconnu',
};

export function getHomelabServiceViews(services: HomelabService[]): HomelabServiceView[] {
  return services.map(service => {
    const typeLabel = service.type === 'vm' ? 'VM' : 'LXC';
    return {
      name: service.name || `Service public sans nom · ${typeLabel}`,
      type: service.type,
      typeLabel,
      status: service.status,
      statusLabel: statusLabels[service.status],
      description: service.description || 'Aucune description publique n’a été fournie.',
    };
  });
}
