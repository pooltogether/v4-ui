import React, { useEffect, useState } from 'react'
import * as Fathom from 'fathom-client'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { ethers } from 'ethers'
import { ToastContainer } from 'react-toastify'
import { ReactQueryDevtools } from 'react-query-devtools'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'jotai'

import { AllContextProviders } from 'lib/components/contextProviders/AllContextProviders'
import { BodyClasses } from 'lib/components/BodyClasses'
import { CustomErrorBoundary } from 'lib/components/CustomErrorBoundary'
import { TransactionStatusChecker } from 'lib/components/TransactionStatusChecker'
import { TxRefetchListener } from 'lib/components/TxRefetchListener'
import { SocialDataFetcher } from 'lib/components/SocialDataFetcher'

import '@reach/dialog/styles.css'
import '@reach/menu-button/styles.css'
import '@reach/tooltip/styles.css'
import 'react-toastify/dist/ReactToastify.css'

import 'assets/styles/index.css'
import '@pooltogether/react-components/dist/index.css'
import { useInitializeOnboard } from '@pooltogether/hooks'
import { LoadingScreen } from '@pooltogether/react-components'
import '../i18n'
import { useTranslation } from 'react-i18next'

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

  // ChunkLoadErrors happen when someone has the app loaded, then we deploy a
  // new release, and the user's app points to previous chunks that no longer exist
  useEffect(() => {
    window.addEventListener('error', (e) => {
      console.log(e)
      if (/Loading chunk [\d]+ failed/.test(e.message)) {
        window.location.reload()
      }
    })
  }, [])

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
        <InitializeOnboard>
          <BodyClasses />

          <ToastContainer className='pool-toast' position='top-center' autoClose={7000} />

          <SocialDataFetcher />

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
        </InitializeOnboard>
      </QueryClientProvider>
    </Provider>
  )
}

const InitializeOnboard = (props) => {
  useInitializeOnboard()
  return props.children
}

export default MyApp
