const path = require('path')
const LocizeBackend = require('i18next-locize-backend/cjs')
const ChainedBackend = require('i18next-chained-backend').default
const LocalStorageBackend = require('i18next-localstorage-backend').default

const isBrowser = typeof window !== 'undefined'

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'de', 'fr', 'hi', 'it', 'ko', 'pt', 'tr', 'zh', 'sk'],
    localePath: path.resolve('./public/locales')
  },
  localePath: path.resolve('./public/locales'),
  backend: {
    projectId: process.env.NEXT_PUBLIC_LOCIZE_PROJECT_ID,
    apiKey: process.env.NEXT_PUBLIC_LOCIZE_DEV_API_KEY,
    referenceLng: 'en',
    backendOptions: [
      {
        expirationTime: 60 * 60 * 1000 // 1 hour
      },
      {
        projectId: process.env.NEXT_PUBLIC_LOCIZE_PROJECT_ID,
        version: 'latest'
      }
    ],
    backends: isBrowser ? [LocalStorageBackend, LocizeBackend] : []
  },
  serializeConfig: false,
  use: isBrowser ? [ChainedBackend] : [],
  detection: {
    // check if language is cached in cookies, if not check local storage
    order: ['cookie', 'localStorage', 'path'],

    // next-i18next by default searches for the 'next-i18next' cookie on server requests
    lookupCookie: 'NEXT_LOCALE',
    lookupLocalStorage: 'i18nextLng',

    // cache the language in cookies and local storage
    caches: ['cookie', 'localStorage']
  }
}
