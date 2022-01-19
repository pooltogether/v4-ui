import * as Sentry from '@sentry/react'

export const sentryLog = (msg: string, walletName?: string): any => {
  Sentry.withScope(function (scope) {
    if (walletName) {
      scope.setTag('web3', walletName)
      scope.setContext('wallet', {
        name: walletName
      })
    }

    Sentry.captureMessage(msg)
  })
}
