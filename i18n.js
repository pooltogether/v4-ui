const env = process.env.NODE_ENV || 'development'
const dev = env !== 'production'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import Locize from 'i18next-locize-backend/cjs'
import LanguageDetector from 'i18next-browser-languagedetector'

const supportedLocales = ['en', 'es', 'de', 'fr', 'hi', 'it', 'ko', 'pt', 'tr', 'zh']

// NOTE: For future reference:
// https://dev.to/adrai/how-to-properly-internationalize-a-react-application-using-i18next-3hdb

// @ts-ignore
i18n
  .use(Locize)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    i18n: {
      defaultLocale: 'en',
      locales: supportedLocales
    },
    // debug: dev,
    partialBundledLanguages: true,
    fallbackLng: 'en',
    supportedLngs: supportedLocales,
    // preload: supportedLocales,
    ns: ['common'],
    defaultNS: 'common',
    saveMissing: dev,
    serializeConfig: false,

    // React config
    react: {
      // trigger a rerender when language is changed
      bindI18n: 'languageChanged',
      // we're NOT using suspsense to detect when the translations have loaded
      useSuspense: false
    },

    // Locize config
    backend: {
      projectId: process.env.NEXT_PUBLIC_LOCIZE_PROJECT_ID,
      apiKey: process.env.NEXT_PUBLIC_LOCIZE_DEV_API_KEY,
      referenceLng: 'en'
    },

    // LanguageDetector config
    detection: {
      // check if language is cached in cookies, if not check local storage
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'path'],

      // next-i18next by default searches for the 'next-i18next' cookie on server requests
      lookupCookie: 'next-i18next',
      lookupLocalStorage: 'i18nextLng',

      // cache the language in cookies and local storage
      caches: ['cookie', 'localStorage']
    }
  })

export default i18n
