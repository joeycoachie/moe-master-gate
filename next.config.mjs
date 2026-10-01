/** @type {import('next').NextConfig} */
const nextConfig = {
  // Armory protocols are read from disk at request time (outside public/ so they
  // stay behind the Architect gate) — make sure Vercel ships them with the route.
  outputFileTracingIncludes: {
    '/ops/armory/[protocolId]': ['./armory/protocols/**/*'],
  },
};

export default nextConfig;