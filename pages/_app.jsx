import React, { useEffect, useState } from 'react'
import i18next from '../i18n'
import * as Fathom from 'fathom-client'
import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import Cookies from 'js-cookie'
import { ethers } from 'ethers'
import { ToastContainer } from 'react-toastify'
import { ReactQueryDevtools } from 'react-query-devtools'
import { motion, AnimatePresence } from 'framer-motion'
import { QueryCache, ReactQueryCacheProvider } from 'react-query'
import { Provider } from 'jotai'

import { COOKIE_OPTIONS, REFERRER_ADDRESS_KEY } from 'lib/constants'
import { AllContextProviders } from 'lib/components/contextProviders/AllContextProviders'
import { BodyClasses } from 'lib/components/BodyClasses'
import { CustomErrorBoundary } from 'lib/components/CustomErrorBoundary'
import { GraphErrorModal } from 'lib/components/GraphErrorModal'
import { Layout } from 'lib/components/Layout'
import { LoadingScreen } from 'lib/components/LoadingScreen'
import { TransactionStatusChecker } from 'lib/components/TransactionStatusChecker'
import { TxRefetchListener } from 'lib/components/TxRefetchListener'
import { SocialDataFetcher } from 'lib/components/SocialDataFetcher'

import '@reach/dialog/styles.css'
import '@reach/menu-button/styles.css'
import '@reach/tooltip/styles.css'
import 'react-toastify/dist/ReactToastify.css'

import 'assets/styles/utils.css'
import 'assets/styles/index.css'
import 'assets/styles/toast-blur.css'
import 'assets/styles/layout.css'
import 'assets/styles/loader.css'
import 'assets/styles/themes.css'

import 'assets/styles/typography.css'
import 'assets/styles/tables.css'
import 'assets/styles/pool.css'
import 'assets/styles/pool-toast.css'
import 'assets/styles/animations.css'
import 'assets/styles/transitions.css'

import 'assets/styles/interactable-cards.css'
import 'assets/styles/forms.css'
import 'assets/styles/tabs.css'
import 'assets/styles/tickets.css'

import 'assets/styles/bnc-onboard--custom.css'
import 'assets/styles/reach--custom.css'
import 'assets/styles/vx--custom.css'

const queryCache = new QueryCache()

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

function MyApp ({ Component, pageProps, router }) {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (router?.query?.referrer) {
      const referrerAddress = router.query.referrer

      try {
        ethers.utils.getAddress(referrerAddress)

        Cookies.set(REFERRER_ADDRESS_KEY, referrerAddress.toLowerCase(), COOKIE_OPTIONS)
      } catch (e) {
        console.error(`referrer address was an invalid Ethereum address:`, e.message)
      }
    }
  }, [])

  useEffect(() => {
    const fathomSiteId = process.env.NEXT_JS_FATHOM_SITE_ID

    if (fathomSiteId) {
      Fathom.load(process.env.NEXT_JS_FATHOM_SITE_ID, {
        url: 'https://goose.pooltogether.com/script.js',
        includedDomains: [
          'app-v3.pooltogether.com',
          'app.pooltogether.com',
          'staging-v3.pooltogether.com'
        ]
      })

      function onRouteChangeComplete (url) {
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

  useEffect(() => {
    const initi18next = async () => {
      await i18next.initPromise.then(() => {
        setInitialized(true)
      })
    }
    initi18next()
  }, [])

  return (
    <>
      <Provider>
        <ReactQueryCacheProvider queryCache={queryCache}>
          <BodyClasses />

          {/* <GraphErrorModal /> */}

          <LoadingScreen initialized={initialized} />

          <ToastContainer className='pool-toast' position='top-center' autoClose={7000} />

          <SocialDataFetcher />

          <AllContextProviders>
            <CustomErrorBoundary>
              <TransactionStatusChecker />

              <TxRefetchListener />

              <Layout props={pageProps}>
                <AnimatePresence exitBeforeEnter>
                  <motion.div
                    id='content-animation-wrapper'
                    key={router.route}
                    transition={{ duration: 0.3, ease: 'easeIn' }}
                    initial={{
                      opacity: 0
                    }}
                    exit={{
                      opacity: 0
                    }}
                    animate={{
                      opacity: 1
                    }}
                  >
                    <Component {...pageProps} />
                  </motion.div>
                </AnimatePresence>
              </Layout>

              <ReactQueryDevtools />
            </CustomErrorBoundary>
          </AllContextProviders>
        </ReactQueryCacheProvider>
      </Provider>
    </>
  )
}

export default MyApp
