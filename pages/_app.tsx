import React, { useEffect } from 'react'
import * as Fathom from 'fathom-client'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'jotai'
import { CUSTOM_WALLETS_CONFIG } from 'lib/customWalletsConfig'
import { useInitCookieOptions, useInitRpcApiKeys, useInitReducedMotion } from '@pooltogether/hooks'
import { useInitializeOnboard } from '@pooltogether/bnc-onboard-hooks'
import {
  ToastContainer,
  LoadingScreen,
  TransactionStatusChecker,
  TxRefetchListener
} from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'

import '../i18n'
import { AllContextProviders } from 'lib/components/contextProviders/AllContextProviders'
import { CustomErrorBoundary } from 'lib/components/CustomErrorBoundary'
import { useSelectedNetworkWatcher } from 'lib/hooks/useSelectedNetwork'

import '@reach/dialog/styles.css'
import '@reach/menu-button/styles.css'
import '@reach/tooltip/styles.css'
import 'react-toastify/dist/ReactToastify.css'

// Carousel for Prizes
import 'react-responsive-carousel/lib/styles/carousel.min.css'

// Custom css
import '../lib/styles/pageHeader.css'

import 'assets/styles/index.css'
import 'assets/styles/tsunami.css'

const queryClient = new QueryClient()

// TODO: Is this necessary? What is this for?
// if (typeof window !== 'undefined') {
//   window.ethers = ethers
// }

if (process.env.NEXT_JS_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_JS_SENTRY_DSN,
    release: process.env.NEXT_JS_RELEASE_VERSION,
    integrations: [new Integrations.BrowserTracing()]
  })
}

function MyApp({ Component, pageProps, router }) {
  const { i18n } = useTranslation()

  useEffect(() => {
    const fathomSiteId = process.env.NEXT_JS_FATHOM_SITE_ID

    if (fathomSiteId) {
      Fathom.load(process.env.NEXT_JS_FATHOM_SITE_ID, {
        url: 'https://goose.pooltogether.com/script.js',
        includedDomains: ['vote.pooltogether.com']
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
        <InitPoolTogetherHooks>
          <ToastContainer className='pool-toast' position='top-center' autoClose={7000} />

          <AllContextProviders>
            <CustomErrorBoundary>
              <TransactionStatusChecker />
              <TxRefetchListener />

              <LoadingScreen isInitialized={i18n.isInitialized}>
                <Component {...pageProps} />
              </LoadingScreen>

              {/* <ReactQueryDevtools /> */}
            </CustomErrorBoundary>
          </AllContextProviders>
        </InitPoolTogetherHooks>
      </QueryClientProvider>
    </Provider>
  )
}

const InitPoolTogetherHooks = ({ children }) => {
  useSelectedNetworkWatcher()
  useInitRpcApiKeys({
    infura: {
      mainnet: process.env.NEXT_JS_INFURA_ID_MAINNET || process.env.NEXT_JS_INFURA_ID,
      polygon: process.env.NEXT_JS_INFURA_ID_POLYGON || process.env.NEXT_JS_INFURA_ID
    },
    quicknode: {
      bsc: process.env.NEXT_JS_QUICKNODE_ID
    }
  })
  useInitReducedMotion(Boolean(process.env.NEXT_JS_REDUCE_MOTION))
  useInitCookieOptions(process.env.NEXT_JS_DOMAIN_NAME)
  useInitializeOnboard({
    infuraId: process.env.NEXT_JS_INFURA_ID,
    fortmaticKey: process.env.NEXT_JS_FORTMATIC_API_KEY,
    portisKey: process.env.NEXT_JS_PORTIS_API_KEY,
    defaultNetworkName: 'homestead',
    customWalletsConfig: CUSTOM_WALLETS_CONFIG
  })
  return children
}

export default MyApp
