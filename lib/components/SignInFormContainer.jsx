import React, { useContext, useEffect } from 'react'
import FeatherIcon from 'feather-icons-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'

import { useTranslation } from 'lib/../i18n'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { WalletContext } from 'lib/components/contextProviders/WalletContextProvider'
import { Meta } from 'lib/components/Meta'
import { SignInForm } from 'lib/components/SignInForm'
import { queryParamUpdater } from 'lib/utils/queryParamUpdater'

export function SignInFormContainer(props) {
  const { t } = useTranslation()
  
  const router = useRouter()
  const showSelectMenu = router.query.showSelectMenu

  const { handleLoadOnboard } = useContext(WalletContext)

  const { connectWallet } = useContext(AuthControllerContext)

  // lazy load onboardjs when sign-in is shown
  useEffect(() => {
    // console.log('handleLoadOnboard on sign in show')
    handleLoadOnboard()

    if (showSelectMenu) {
      const postSignInCallback = () => {
        queryParamUpdater.remove(router, 'signIn')
      }

      connectWallet(postSignInCallback)
    }
  }, [])
  
  // could easily refactor into a custom hook
  useEffect(() => {
    const escToClose = (e) => {
      if (e.keyCode === 27) {
        handleCloseSignIn()
      }
    }

    document.addEventListener('keydown', escToClose)

    return () => {
      document.removeEventListener('keydown', escToClose)
    }
  }, [])

  const handleCloseSignIn = () => {
    queryParamUpdater.remove(router, 'signIn')

    if (router.asPath.match('account')) {
      router.push('/', '/', { shallow: true })
    }
  }

  return <>
    <Meta
      title={t('signIn')}
    />

    <motion.div
      onClick={handleCloseSignIn}
      key='sign-in-scaled-bg'
      className='fixed t-0 l-0 r-0 b-0 w-full h-full z-40 bg-overlay'
      initial={{ scale: 0 }}
      animate={{ scale: 1, transition: { duration: 0.1 } }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    />

    <motion.div
      key='sign-in-pane'
      className='fixed t-0 l-0 r-0 w-full z-40 bg-darkened'
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.25 }}
      style={{
        maxHeight: 300,
      }}
    >
      <nav
        className='fixed t-0 l-0 r-0 w-full px-4 pt-4 flex items-start justify-between h-20'
      >
        <div></div>
        <button
          type='button'
          onClick={handleCloseSignIn}
          className='text-accent-1 hover:text-inverse trans outline-none focus:outline-none active:outline-none'
        >
          <FeatherIcon
            icon='x-circle'
            className='w-5 h-5 sm:w-16 sm:h-16 opacity-60'
            strokeWidth='0.09rem'
          />
        </button>
      </nav>

      <div
        className='flex flex-col justify-center px-10 xs:px-0 sm:px-12 lg:px-32 py-6 text-center mx-auto shadow-2xl'
      >
        <SignInForm
          hideImg
          descriptionClassName='mb-4 text-xxs xs:text-sm sm:text-xl lg:text-2xl xs:w-1/2 sm:w-1/2 lg:w-full mx-auto'
          postSignInCallback={() => {
            queryParamUpdater.remove(router, 'signIn')
          }}
        />
      </div>
    </motion.div>
  </>
}
