import React, { useContext, useEffect } from 'react'
import { Provider as JotaiProvider } from 'jotai'
import { createClient, Provider as WagmiProvider } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { BaseProvider } from '@ethersproject/providers'
import * as Fathom from 'fathom-client'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import {
  ScreenSize,
  useScreenSize,
  useInitCookieOptions,
  useInitReducedMotion,
  initProviderApiKeys as initProviderApiKeysForHooks
} from '@pooltogether/hooks'
import { ThemeContext, ThemeContextProvider } from '@pooltogether/react-components'
import { Slide, ToastContainer, ToastContainerProps } from 'react-toastify'

import type { AppProps } from 'next/app'

import '../../i18n'
import { CustomErrorBoundary } from '@components/CustomErrorBoundary'
import { initSentry } from '@utils/services/initSentry'

// Custom css
import '@assets/styles/index.css'
import '@pooltogether/react-components/dist/globals.css'
import '@assets/styles/gradients.css'
import '@assets/styles/tsunami.css'

// Bottom sheet
import 'react-toastify/dist/ReactToastify.css'
import 'react-spring-bottom-sheet/dist/style.css'
import '@assets/styles/bottomSheet.css'
import { getSupportedChains } from '@utils/getSupportedChains'
import { CHAIN_ID } from '@constants/misc'
import {
  getReadProvider,
  getRpcUrl,
  getRpcUrls,
  useUpdateStoredPendingTransactions,
  initProviderApiKeys as initProviderApiKeysForWalletConnection
} from '@pooltogether/wallet-connection'
import { RPC_API_KEYS } from '@constants/config'

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
// Initialize read provider API keys to @pooltogether/hooks
initProviderApiKeysForHooks(RPC_API_KEYS)
// Initialize read provider API keys to @pooltogether/wallet-connection
initProviderApiKeysForWalletConnection(RPC_API_KEYS)
// Initialize Sentry error logging
initSentry()

// Initialize WAGMI wallet connectors
const chains = getSupportedChains()
const connectors = ({ chainId }) => {
  return [
    new MetaMaskConnector({ chains, options: {} }),
    new WalletConnectConnector({
      chains,
      options: {
        chainId: chainId || CHAIN_ID.mainnet,
        rpc: getRpcUrls(
          chains.map((chain) => chain.id),
          RPC_API_KEYS
        ),
        bridge: 'https://pooltogether.bridge.walletconnect.org/',
        qrcode: true
      }
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'PoolTogether',
        jsonRpcUrl: getRpcUrl(chainId || CHAIN_ID.mainnet, RPC_API_KEYS)
      }
    }),
    new InjectedConnector({ chains, options: {} })
  ]
}
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider: ({ chainId }) =>
    (chainId
      ? getReadProvider(chainId, RPC_API_KEYS)
      : getReadProvider(CHAIN_ID.mainnet, RPC_API_KEYS)) as BaseProvider
})

function MyApp({ Component, pageProps, router }: AppProps) {
  useInitPoolTogetherHooks()

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

  useEffect(() => {
    const handleExitComplete = () => {
      if (typeof window !== 'undefined') {
        // window.scrollTo({ top: 0 })

        // make sure opacity gets set back to 1 after page transitions!
        setTimeout(() => {
          const elem = document.getElementById('content-animation-wrapper')

          // in case the animation failed
          if (elem) {
            elem.style.opacity = '1'
          }
        }, 1000)
      }
    }

    router.events.on('routeChangeComplete', handleExitComplete)
    return () => {
      router.events.off('routeChangeComplete', handleExitComplete)
    }
  }, [])

  return (
    <WagmiProvider client={wagmiClient}>
      <JotaiProvider>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools />
          <ThemeContextProvider>
            <ThemedToastContainer />
            <CustomErrorBoundary>
              <Component {...pageProps} />
            </CustomErrorBoundary>
          </ThemeContextProvider>
        </QueryClientProvider>
      </JotaiProvider>
    </WagmiProvider>
  )
}

const ThemedToastContainer: React.FC<ToastContainerProps> = (props) => {
  // These hooks doesn't quite fit here, it needs to be nested below Jotai though.
  useUpdateStoredPendingTransactions()
  // TODO: wat? useSelectedChainIdWatcher()

  const { theme } = useContext(ThemeContext)
  const screenSize = useScreenSize()
  return (
    <ToastContainer
      {...props}
      limit={3}
      style={{ zIndex: '99999' }}
      position={screenSize > ScreenSize.sm ? 'bottom-right' : 'top-center'}
      autoClose={7000}
      theme={theme}
      transition={Slide}
      closeOnClick={false}
    />
  )
}

/**
 * Initializes PoolTogether tooling global state
 */
const useInitPoolTogetherHooks = () => {
  useInitReducedMotion(Boolean(process.env.NEXT_PUBLIC_REDUCE_MOTION))
  useInitCookieOptions(process.env.NEXT_PUBLIC_DOMAIN_NAME)
}

export default MyApp
