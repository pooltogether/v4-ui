import NextI18Next from 'next-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import Locize from 'i18next-locize-backend'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
const { locizeProjectId, locizeApiKey, locizeVersion } = publicRuntimeConfig

const nextI18NextInstance = new NextI18Next({
  use: [LanguageDetector, initReactI18next, Locize],
  saveMissing: true,
  backend: {
    projectId: locizeProjectId,
    apiKey: locizeApiKey,
    version: locizeVersion || 'latest',
    referenceLng: 'en',
    debug: true
  },
  defaultLanguage: 'en',
  fallbackLng: 'en',
  otherLanguages: ['es', 'de', 'fr', 'it', 'ko', 'pt', 'tr', 'zh'], // list all languages here
  detection: {
    // check if language is cached in cookies, if not check local storage
    order: ['querystring', 'cookie', 'localStorage', 'navigator', 'path'],

    // next-i18next by default searches for the 'next-i18next' cookie on server requests
    lookupCookie: 'next-i18next',
    lookupLocalStorage: 'i18nextLng',

    // cache the language in cookies and local storage
    caches: ['cookie', 'localStorage']
  },
  react: {
    // trigger a rerender when language is changed
    bindI18n: 'languageChanged',
    // we're NOT using suspsense to detect when the translations have loaded
    useSuspense: false
  }
})

export default nextI18NextInstance

export const {
  // appWithTranslation,
  Router,
  Link,
  Trans,
  config,
  // withTranslation,
  useTranslation,
  i18n,
} = nextI18NextInstance
