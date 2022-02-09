import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'

export const initSentry = () => {
  if (process.env.NEXT_JS_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_JS_SENTRY_DSN,
      // NEXT_JS_RELEASE_VERSION: Set in package.json when releasing
      release: process.env.NEXT_JS_RELEASE_VERSION,
      environment: process.env.NEXT_JS_SENTRY_ENV || 'staging',
      integrations: [
        new Integrations.BrowserTracing(),
        new Sentry.Integrations.Breadcrumbs({
          console: false
        })
      ]
    })
  }
}
