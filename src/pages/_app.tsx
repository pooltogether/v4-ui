import React, { useEffect } from 'react'
import * as Fathom from 'fathom-client'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { Provider } from 'jotai'
import {
  useInitCookieOptions,
  useInitReducedMotion,
  initProviderApiKeys
} from '@pooltogether/hooks'
import { useInitializeOnboard } from '@pooltogether/bnc-onboard-hooks'
import {
  ToastContainer,
  TransactionStatusChecker,
  TxRefetchListener
} from '@pooltogether/react-components'
import type { AppProps } from 'next/app'

import '../../i18n'
import { CUSTOM_WALLETS_CONFIG } from '@src/customWalletsConfig'
import { AllContextProviders } from '@src/components/contextProviders/AllContextProviders'
import { CustomErrorBoundary } from '@src/components/CustomErrorBoundary'
import { useSelectedChainIdWatcher } from '@src/hooks/useSelectedChainId'
import { sentryLog } from '@src/services/sentryLog'

import '@reach/dialog/styles.css'
import '@reach/menu-button/styles.css'
import '@reach/tooltip/styles.css'
import 'react-toastify/dist/ReactToastify.css'

// Bottom sheet
import 'react-spring-bottom-sheet/dist/style.css'
import '@assets/styles/bottomSheet.css'

// Custom css
import '@assets/styles/gradients.css'
import '@assets/styles/index.css'
import '@assets/styles/tsunami.css'
import { initSentry } from '@src/services/initSentry'

const queryClient = new QueryClient()

// Initialize read provider API keys
initProviderApiKeys({
  alchemy: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  etherscan: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
  infura: process.env.NEXT_PUBLIC_INFURA_ID
})

// Initialize Sentry error logging
initSentry()

function MyApp({ Component, pageProps, router }: AppProps) {
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
    <Provider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools />
        <InitPoolTogetherHooks>
          <ToastContainer className='pool-toast' position='top-center' autoClose={7000} />

          <AllContextProviders>
            <CustomErrorBoundary>
              <TransactionStatusChecker />
              <TxRefetchListener />

              <Component {...pageProps} />
            </CustomErrorBoundary>
          </AllContextProviders>
        </InitPoolTogetherHooks>
      </QueryClientProvider>
    </Provider>
  )
}

const InitPoolTogetherHooks = ({ children }) => {
  useSelectedChainIdWatcher()
  useInitReducedMotion(Boolean(process.env.NEXT_PUBLIC_REDUCE_MOTION))
  useInitCookieOptions(process.env.NEXT_PUBLIC_DOMAIN_NAME)
  useInitializeOnboard({
    infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
    fortmaticKey: process.env.NEXT_PUBLIC_FORTMATIC_API_KEY,
    portisKey: process.env.NEXT_PUBLIC_PORTIS_API_KEY,
    defaultNetworkName: 'homestead',
    customWalletsConfig: CUSTOM_WALLETS_CONFIG,
    sentryLog
  })
  return children
}

export default MyApp
