import { Provider as JotaiProvider } from 'jotai'
import * as Fathom from 'fathom-client'
import { createClient, WagmiConfig } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { useTranslation } from 'react-i18next'
import {
  LoadingScreen,
  ThemeContext,
  ThemeContextProvider,
  useScreenSize,
  ScreenSize
} from '@pooltogether/react-components'
import { CustomErrorBoundary } from './CustomErrorBoundary'
import { getReadProvider, initRpcUrls } from '@pooltogether/wallet-connection'
import '../utils/services/i18n'
import { ToastContainer, ToastContainerProps } from 'react-toastify'
import { useContext, useEffect } from 'react'
import { getSupportedChains } from '@utils/getSupportedChains'
import { AppProps } from 'next/app'
import { CHAIN_ID } from '@constants/misc'
import { useInitialLoad } from '@hooks/useInitialLoad'
import { initSentry } from '@utils/services/initSentry'
import { RPC_URLS } from '@constants/config'

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

// Initialize WAGMI wallet connectors
const chains = getSupportedChains()
const connectors = () => {
  return [
    new MetaMaskConnector({ chains, options: {} }),
    new WalletConnectConnector({
      chains,
      options: {
        bridge: 'https://pooltogether.bridge.walletconnect.org/',
        qrcode: true
      }
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'PoolTogether'
      }
    }),
    new InjectedConnector({ chains, options: {} })
  ]
}

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider: ({ chainId }) => {
    return getReadProvider(chainId || CHAIN_ID.mainnet)
  }
})

/**
 * AppContainer wraps all pages in the app. Used to set up globals.
 * @param props
 * @returns
 */
export const AppContainer: React.FC<AppProps> = (props) => {
  const { Component, pageProps, router } = props

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
  }, [])

  return (
    <WagmiConfig client={wagmiClient}>
      <JotaiProvider>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools />
          <ThemeContextProvider>
            <ThemedToastContainer />
            <CustomErrorBoundary>
              <Content {...props} />
            </CustomErrorBoundary>
          </ThemeContextProvider>
        </QueryClientProvider>
      </JotaiProvider>
    </WagmiConfig>
  )
}

const Content: React.FC<AppProps> = (props) => {
  const { Component, pageProps } = props
  const isInitialized = useInitialLoad()
  const { i18n } = useTranslation()
  if (!isInitialized || !i18n.isInitialized) {
    return <LoadingScreen />
  }
  return <Component {...pageProps} />
}

const ThemedToastContainer: React.FC<ToastContainerProps> = (props) => {
  const { theme } = useContext(ThemeContext)
  const screenSize = useScreenSize()
  return (
    <ToastContainer
      {...props}
      style={{ zIndex: '99999' }}
      position={screenSize > ScreenSize.sm ? 'bottom-right' : 'top-center'}
      autoClose={7000}
      theme={theme}
    />
  )
}
