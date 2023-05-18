import { RPC_URLS } from '@constants/config'
import { useActualFullScreen } from '@hooks/useActualFullScreen'
import { useAllPrizePoolTokens } from '@hooks/v4/PrizePool/useAllPrizePoolTokens'
import { useInitCookieOptions } from '@pooltogether/hooks'
import { LoadingScreen, useScreenSize, ScreenSize } from '@pooltogether/react-components'
import { initRpcUrls, useUpdateStoredPendingTransactions } from '@pooltogether/wallet-connection'
import { FathomEvent, logEvent } from '@utils/services/fathom'
import { initSentry } from '@utils/services/initSentry'
import * as Fathom from 'fathom-client'
import { Provider as JotaiProvider } from 'jotai'
import { AppProps } from 'next/app'
import { useTranslation } from 'next-i18next'
import { ThemeProvider, useTheme } from 'next-themes'
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { ToastContainer, ToastContainerProps } from 'react-toastify'
import { useAccount } from 'wagmi'
import { CustomErrorBoundary } from './CustomErrorBoundary'
import { WalletConnectionContainer } from './WalletConnectionContainer'

// Initialize react-query Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false
    }
  }
})

// Initialize Sentry error logging
initSentry()

// Initialize global RPC URLs for external packages
initRpcUrls(RPC_URLS)

/**
 * AppContainer wraps all pages in the app. Used to set up globals.
 * @param props
 * @returns
 */
export const AppContainer: React.FC<AppProps> = (props) => {
  const { router } = props

  useEffect(() => {
    const fathomSiteId = process.env.NEXT_PUBLIC_FATHOM_SITE_ID
    if (fathomSiteId) {
      Fathom.load(process.env.NEXT_PUBLIC_FATHOM_SITE_ID, {
        url: 'https://goose.pooltogether.com/script.js',
        includedDomains: ['app.pooltogether.com', 'v4.pooltogether.com']
      })
      const onRouteChangeComplete = (url) => {
        if (window['fathom']) {
          window['fathom'].trackPageview()
        }
      }
      router.events.on('routeChangeComplete', onRouteChangeComplete)
      return () => {
        router.events.off('routeChangeComplete', onRouteChangeComplete)
      }
    }
    // Add count if user is coming from a Coinbase app
    if (navigator?.userAgent === 'CoinbaseRetail') {
      logEvent(FathomEvent.coinbaseAppUser)
    }
  }, [])

  return (
    <WalletConnectionContainer>
      <JotaiProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute='class' defaultTheme='dark'>
            <ReactQueryDevtools />
            <ThemedToastContainer />
            <CustomErrorBoundary>
              <Content {...props} />
            </CustomErrorBoundary>
          </ThemeProvider>
        </QueryClientProvider>
      </JotaiProvider>
    </WalletConnectionContainer>
  )
}

const Content: React.FC<AppProps> = (props) => {
  const { Component, pageProps } = props
  const isInitialized = useInitialLoad()

  if (!isInitialized) {
    return <LoadingScreen />
  }
  return <Component {...pageProps} />
}

const useInitialLoad = () => {
  const { i18n } = useTranslation()
  useActualFullScreen()
  useUpdateStoredPendingTransactions()
  useInitCookieOptions(process.env.NEXT_PUBLIC_DOMAIN_NAME)
  const { status } = useAccount()
  const queryResults = useAllPrizePoolTokens()
  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
  return !!i18n.isInitialized && status !== 'reconnecting' && !!isFetched
}

const ThemedToastContainer: React.FC<ToastContainerProps> = (props) => {
  const { theme, systemTheme } = useTheme()
  const screenSize = useScreenSize()
  return (
    <ToastContainer
      {...props}
      style={{ zIndex: '99999' }}
      position={screenSize > ScreenSize.sm ? 'bottom-right' : 'top-center'}
      autoClose={7000}
      theme={theme === 'system' ? systemTheme : (theme as 'dark' | 'light')}
    />
  )
}
