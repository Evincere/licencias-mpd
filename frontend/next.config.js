/** @type {import('next').NextConfig} */
const nextConfig = {
  // Variables de entorno
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },

  // Optimizaciones experimentales
  experimental: {
    optimizePackageImports: [
      'recharts',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip'
    ],
  },

  // Configuración de rewrites para API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_BASE_URL || 'http://localhost:3001'}/:path*`,
      },
    ]
  },

  // Configuración de imágenes optimizadas
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días
  },

  // Headers de performance y seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },

  // Optimizaciones de webpack
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimizar chunks en producción
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          recharts: {
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            name: 'recharts',
            priority: 20,
            reuseExistingChunk: true,
          },
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'radix-ui',
            priority: 20,
            reuseExistingChunk: true,
          },
          icons: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'icons',
            priority: 20,
            reuseExistingChunk: true,
          },
        },
      }
    }

    return config
  },

  // Configuraciones de calidad
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Optimizaciones generales
  compress: true,
  optimizeFonts: true,
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,

  // Redirect principal
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
