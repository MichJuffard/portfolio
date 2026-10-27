export type HomelabServiceType = 'vm' | 'lxc';
export type HomelabServiceStatus = 'running' | 'stopped' | 'unknown';
export type HomelabInventoryFreshness = 'current' | 'stale' | 'inconsistent';

export interface HomelabService {
  id?: string;
  name?: string;
  description?: string;
  type: HomelabServiceType;
  status: HomelabServiceStatus;
}

export interface HomelabInventory {
  collected_at: string;
  services: HomelabService[];
}

export interface HomelabServiceView {
  name: string;
  type: HomelabServiceType;
  typeLabel: string;
  status: HomelabServiceStatus;
  statusLabel: string;
  description: string;
}
