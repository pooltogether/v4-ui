import { RPC_URLS } from '@constants/config'
import { useActualFullScreen } from '@hooks/useActualFullScreen'
import { useAllPrizePoolTokens } from '@hooks/v4/PrizePool/useAllPrizePoolTokens'
import { useInitCookieOptions } from '@pooltogether/hooks'
import { LoadingScreen, useScreenSize, ScreenSize } from '@pooltogether/react-components'
import {
  CHAIN_ID,
  getReadProvider,
  getRpcUrls,
  initRpcUrls,
  useUpdateStoredPendingTransactions
} from '@pooltogether/wallet-connection'
import {
  connectorsForWallets,
  RainbowKitProvider,
  lightTheme,
  darkTheme,
  DisclaimerComponent
} from '@rainbow-me/rainbowkit'
import {
  injectedWallet,
  rainbowWallet,
  walletConnectWallet,
  metaMaskWallet,
  coinbaseWallet
} from '@rainbow-me/rainbowkit/wallets'
import { getSupportedChains } from '@utils/getSupportedChains'
import { FathomEvent, logEvent } from '@utils/services/fathom'
import { initSentry } from '@utils/services/initSentry'
import * as Fathom from 'fathom-client'
import { Provider as JotaiProvider } from 'jotai'
import { AppProps } from 'next/app'
import { Trans } from 'next-i18next'
import { useTranslation } from 'next-i18next'
import { ThemeProvider, useTheme } from 'next-themes'
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { ToastContainer, ToastContainerProps } from 'react-toastify'
import { createClient, useAccount, WagmiConfig, configureChains } from 'wagmi'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { publicProvider } from '@wagmi/core/providers/public'
import { CustomErrorBoundary } from './CustomErrorBoundary'

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
const supportedChains = getSupportedChains()

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      injectedWallet({ chains: supportedChains }),
      walletConnectWallet({ chains: supportedChains }),
      coinbaseWallet({ chains: supportedChains, appName: 'PoolTogether' }),
      metaMaskWallet({ chains: supportedChains }),
      rainbowWallet({ chains: supportedChains })
    ]
  }
])

const { chains, provider } = configureChains(supportedChains, [
  jsonRpcProvider({
    rpc: (chain) => ({
      http: RPC_URLS[chain.id]
    })
  }),
  publicProvider()
])

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

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
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        theme={{
          lightMode: lightTheme({
            accentColor: '#ff77e1',
            accentColorForeground: '#1A1B1F',
            borderRadius: 'small',
            overlayBlur: 'small'
          }),
          darkMode: darkTheme({
            accentColor: '#35f0d0',
            accentColorForeground: '#1A1B1F',
            borderRadius: 'small',
            overlayBlur: 'small'
          })
        }}
        chains={chains}
        appInfo={{
          appName: 'PoolTogether',
          disclaimer: Disclaimer
        }}
      >
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
      </RainbowKitProvider>
    </WagmiConfig>
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

const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    <Trans
      i18nKey='connectWalletTermsAndDisclaimerBlurb'
      components={{
        termsLink: <Link href='https://pooltogether.com/terms/' children={undefined} />,
        disclaimerLink: (
          <Link href='https://pooltogether.com/protocol-disclaimer/' children={undefined} />
        )
      }}
    />
  </Text>
)
