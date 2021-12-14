import React from 'react'
import { LoadingLogo } from '@pooltogether/react-components'
import classNames from 'classnames'

import { PageHeader } from 'lib/components/Layout/PageHeader'
import { useInitialLoad } from 'lib/hooks/useInitialLoad'
import { BottomNavigation } from './Navigation'

interface LayoutProps {
  className?: string
  children: React.ReactNode
}

const Layout = (props: LayoutProps) => {
  const { children, className } = props
  const isInitialized = useInitialLoad()

  if (!isInitialized) {
    return (
      <div className={classNames(className, 'min-h-screen')}>
        <PageHeader />
        <div className='flex flex-col h-screen absolute top-0 w-screen'>
          <LoadingLogo className='m-auto' />
        </div>
        <BottomNavigation />
      </div>
    )
  }

  return (
    <div className={classNames(className, 'min-h-screen')}>
      <PageHeader />
      {children}
      <BottomNavigation />
    </div>
  )
}

export default Layout
