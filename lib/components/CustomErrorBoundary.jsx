import React from 'react'
import * as Sentry from '@sentry/react'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'

import { ErrorPage } from 'lib/views/ErrorPage'

class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError (error) {
    return { hasError: true }
  }

  render () {
    if (this.state.hasError) {
      return <ErrorPage />
    }

    return this.props.children
  }
}

export function CustomErrorBoundary (props) {
  const { children } = props
  const { walletName } = useOnboard()

  if (!process.env.NEXT_JS_SENTRY_DSN) {
    return <ErrorBoundary>{children}</ErrorBoundary>
  } else {
    return (
      <>
        <Sentry.ErrorBoundary
          beforeCapture={(scope) => {
            scope.setTag('web3', walletName)

            scope.setContext('wallet', {
              name: walletName
            })
          }}
          fallback={({ error, componentStack, resetError }) => <ErrorPage />}
        >
          {children}
        </Sentry.ErrorBoundary>
      </>
    )
  }
}
