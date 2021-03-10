import React, { useContext } from 'react'
import Cookies from 'js-cookie'
import * as Sentry from '@sentry/react'

import { SELECTED_WALLET_COOKIE_KEY } from 'lib/constants'
import { WalletContext } from 'lib/components/contextProviders/WalletContextProvider'
import { ErrorPage } from 'lib/components/ErrorPage'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage />
    }

    return this.props.children
  }
}

export function CustomErrorBoundary(props) {
  const { children } = props
  const { onboardWallet } = useContext(WalletContext)

  let walletName = onboardWallet?.name

  if (!walletName) {
    walletName = Cookies.get(SELECTED_WALLET_COOKIE_KEY)
  }

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
