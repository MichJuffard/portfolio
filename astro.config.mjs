import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  vite: {
    server: {
      proxy: {
        '/data/homelab-inventory.json': {
          target: 'https://mjuffard.fr',
          changeOrigin: true,
          secure: true,
        },
        '/data/homelab-metrics.json': {
          target: 'https://mjuffard.fr',
          changeOrigin: true,
          secure: true,
        },
      },
    },
  },
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
