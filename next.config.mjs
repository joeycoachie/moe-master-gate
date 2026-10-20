/** @type {import('next').NextConfig} */
const nextConfig = {
  // Armory protocols are read from disk at request time (outside public/ so they
  // stay behind the Architect gate) — make sure Vercel ships them with the route.
  outputFileTracingIncludes: {
    '/ops/armory/[protocolId]': ['./armory/protocols/**/*', './armory/client-bar.js'],
    '/ops/command': ['./hub/ROADMAP.md', './hub/LEDGER.md', './hub/LINKS.md', './hub/HVO_PLAYBOOK.md'],
    '/ops/archive/[[...path]]': ['./archive/*.html', './archive/data/**/*.json', './archive/BRAIN.md', './archive/docs/*.md'],
  },
  // RECUP.STN pages on our own domain (studio.theoperatorplaybook.com/recup/…), clean URLs.
  async rewrites() {
    return [{ source: '/recup/guide', destination: '/recup/guide.html' }];
  },
};

export default nextConfig;