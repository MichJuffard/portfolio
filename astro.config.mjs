import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  redirects: {
    '/homelab/': '/projets/homelab/',
    '/projets/proxmox/': '/projets/homelab/#proxmox',
    '/projets/debian-ssh/': '/projets/homelab/#debian',
    '/projets/diagnostic-reseau/': '/projets/homelab/#diagnostic-reseau',
    '/projets/snowcrash/': '/projets/ctf/#snowcrash',
    '/projets/rainfall/': '/projets/ctf/#rainfall',
    '/projets/override/': '/projets/ctf/#override',
  },
});
