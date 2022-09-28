import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react'
import { ErrorPage } from '@views/ErrorPage'
import React from 'react'
import { useAccount } from 'wagmi'

export function CustomErrorBoundary(props) {
  const { children } = props
  const { connector, address } = useAccount()

  return (
    <SentryErrorBoundary
      onError={(error) => {
        const chunkFailedMessage = /Loading chunk [\d]+ failed/
        if (chunkFailedMessage.test(error.message)) {
          window.location.reload()
        }
      }}
      beforeCapture={(scope) => {
        scope.setTag('web3', connector?.name)
        scope.setContext('wallet', {
          name: connector?.name,
          address
        })
      }}
      fallback={({ error, componentStack, resetError }) => <ErrorPage />}
    >
      {children}
    </SentryErrorBoundary>
  )
}
