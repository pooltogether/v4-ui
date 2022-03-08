const chalk = require("chalk")
const path = require('path');
const isProduction = process.env.NODE_ENV === 'production'

const nextConfig = {
  reactStrictMode: true,
  generateEtags: false,
  compress: false,
  productionBrowserSourceMaps: true,
  inlineImageLimit: 48, // make it tiny so that it doesn't inline,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    disableStaticImages: true, // disable next/image so images are imported properly for `next export`
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/deposit',
        permanent: false,
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/pooltogether.tokenlist.json',
        destination: 'https://raw.githubusercontent.com/pooltogether/pooltogether-token-list/main/pooltogether.tokenlist.json',
        basePath: undefined,
      },
    ]
  },
  publicRuntimeConfig: {
    locizeProjectId: process.env.NEXT_PUBLIC_LOCIZE_PROJECT_ID,
    locizeApiKey: process.env.NEXT_PUBLIC_LOCIZE_DEV_API_KEY,
    locizeVersion: process.env.NEXT_PUBLIC_LOCIZE_VERSION
  },
  webpack(config, options) {

    config.resolve.alias = {
      ...config.resolve.alias,
      '@abis': path.resolve(__dirname, './src/abis'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@interfaces': path.resolve(__dirname, './src/interfaces'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@views': path.resolve(__dirname, './src/views'),
    };

    config.module.rules = [
        ...config.module.rules,
        {
          test: /\.png/,
          type: 'asset/resource'
        },
        {
          test: /\.svg/,
          type: 'asset/resource'
        }
    ]


    return config
  }
}


console.log('')
console.log(chalk.green('Using next.js config options:'))
console.log(nextConfig)
console.log('')

module.exports = nextConfig
