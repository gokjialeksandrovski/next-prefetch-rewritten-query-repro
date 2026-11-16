import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  rewrites: async () => [
    { source: '/list', missing: [{ type: 'query', key: 'page' }], destination: '/list/first' },
    { source: '/list', destination: '/list/q' },
  ],
}

export default nextConfig
