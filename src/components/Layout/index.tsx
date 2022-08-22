import React, { useEffect } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { LoadingLogo } from '@pooltogether/react-components'

import { PageHeader } from '@components/Layout/PageHeader'
import { useInitialLoad } from '@hooks/useInitialLoad'
import { Navigation } from './Navigation'
import { AlertBanners } from '@components/AlertBanners'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface LayoutProps {
  className?: string
  children: React.ReactNode
}

const Layout = (props: LayoutProps) => {
  const { children, className } = props

  const isInitialized = useInitialLoad()
  const { i18n } = useTranslation()

  const shouldReduceMotion = useReducedMotion()
  const isReady = isInitialized && i18n.isInitialized

  if (isReady) {
    return (
      <div className={classNames(className, 'minimal-scrollbar')}>
        <AlertBanners />
        <PageHeader />
        <Navigation />
        {children}
      </div>
    )
  }

  return (
    <div className={classNames(className, '')}>
      <AnimatePresence>
        <motion.div
          key={`loading-animation`}
          transition={{ duration: shouldReduceMotion ? 0 : 0.1, ease: 'easeIn' }}
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          className={'flex flex-col h-screen absolute top-0 w-screen'}
        >
          <LoadingLogo className='m-auto' />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default Layout
