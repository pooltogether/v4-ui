import React from 'react'
import { LoadingLogo } from '@pooltogether/react-components'
import classNames from 'classnames'

import { PageHeader } from 'lib/components/Layout/PageHeader'
import { useInitialLoad } from 'lib/hooks/useInitialLoad'

interface LayoutProps {
  className?: string
  children: React.ReactNode
}

const Layout = (props: LayoutProps) => {
  const { children, className, ...containerProps } = props
  const isInitialized = useInitialLoad()

  // TODO: Temporary since we don't have any production pools
  // People can't see the settings to turn on testnet mode.
  if (!isInitialized) {
    return (
      <div className={classNames(className, 'min-h-screen')}>
        <PageHeader />
        <div className='flex flex-col h-screen absolute top-0 w-screen'>
          <LoadingLogo className='m-auto' />
        </div>
      </div>
    )
  }

  return (
    <div className={classNames(className, 'min-h-screen')}>
      <PageHeader />
      {children}
    </div>
  )
}

export default Layout
