import React, { useEffect } from 'react'
import * as Fathom from 'fathom-client'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { ethers } from 'ethers'
import { ReactQueryDevtools } from 'react-query-devtools'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'jotai'
import {
  useInitCookieOptions,
  useInitInfuraId,
  useInitQuickNodeId,
  useInitReducedMotion,
  useInitTheGraphApiKey
} from '@pooltogether/hooks'
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

import '@reach/dialog/styles.css'
import '@reach/menu-button/styles.css'
import '@reach/tooltip/styles.css'
import '@pooltogether/react-components/dist/index.css'

import 'assets/styles/index.css'
import { useSelectedNetworkWatcher } from 'lib/hooks/useSelectedNetwork'

const queryClient = new QueryClient()

if (typeof window !== 'undefined') {
  window.ethers = ethers
}

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

      function onRouteChangeComplete(url) {
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

              <ReactQueryDevtools />
            </CustomErrorBoundary>
          </AllContextProviders>
        </InitPoolTogetherHooks>
      </QueryClientProvider>
    </Provider>
  )
}

const InitPoolTogetherHooks = ({ children }) => {
  useSelectedNetworkWatcher()
  useInitInfuraId(process.env.NEXT_JS_INFURA_ID)
  useInitQuickNodeId(process.env.NEXT_JS_QUICKNODE_ID)
  useInitTheGraphApiKey(process.env.NEXT_JS_THE_GRAPH_API_KEY)
  useInitReducedMotion(Boolean(process.env.NEXT_JS_REDUCE_MOTION))
  useInitCookieOptions(process.env.NEXT_JS_DOMAIN_NAME)
  useInitializeOnboard({
    infuraId: process.env.NEXT_JS_INFURA_ID,
    fortmaticKey: process.env.NEXT_JS_FORTMATIC_API_KEY,
    portisKey: process.env.NEXT_JS_PORTIS_API_KEY,
    defaultNetworkName: process.env.NEXT_JS_DEFAULT_ETHEREUM_NETWORK_NAME
  })
  return children
}

export default MyApp
