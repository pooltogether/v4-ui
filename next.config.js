const chalk = require("chalk")
const path = require('path')
const withImages = require('next-images')
const webpack = require('webpack')
const _ = require('lodash')

const isProduction = process.env.NODE_ENV === 'production'

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  generateEtags: false,
  future: {
    webpack5: true,
    strictPostcssConfiguration: true
  },
  compress: false,
  productionBrowserSourceMaps: true,
  inlineImageLimit: 48, // make it tiny so that it doesn't inline,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  }
}

const allConfig =
  withBundleAnalyzer(
  withImages(
    {
      ...nextConfig,
      // NOTE: This redirect is only for localhost. We have a _redirects file for the production deployments
      async redirects() {
        return [
          {
            source: '/',
            destination: '/deposit',
            permanent: false,
          }
        ]
      },
      publicRuntimeConfig: {
        locizeProjectId: process.env.NEXT_JS_LOCIZE_PROJECT_ID,
        locizeApiKey: process.env.NEXT_JS_LOCIZE_DEV_API_KEY,
        locizeVersion: process.env.NEXT_JS_LOCIZE_VERSION
      },
      webpack(config, options) {
        // config.optimization.minimizer = []

        config.mode = isProduction ? 'production' : 'development'
        config.devtool = isProduction ? 'hidden-source-map' : 'eval-source-map'

        var appVars = _.keys(process.env).filter(key => key.startsWith('NEXT_JS_'))

        config.plugins.push(new webpack.EnvironmentPlugin(_.pick(process.env, appVars)))

        return config
      }
    }
  ))

console.log('')
console.log(chalk.green('Using next.js config options:'))
console.log(allConfig)
console.log('')

module.exports = allConfig
