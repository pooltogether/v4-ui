import React from 'react'
import { LoadingDots, LoadingScreen } from '@pooltogether/react-components'
import classNames from 'classnames'

import { PageHeader } from 'lib/components/Layout/PageHeader'
import { useInitialLoad } from 'lib/hooks/useInitialLoad'

interface LayoutProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const Layout = (props: LayoutProps) => {
  const { children, className, ...containerProps } = props
  const isInitialized = useInitialLoad()

  // TODO: Temporary since we don't have any production pools
  // People can't see the settings to turn on testnet mode.
  if (!isInitialized) {
    return (
      <div {...containerProps} className={classNames(className, '')}>
        <PageHeader />
        <LoadingDots />
      </div>
    )
  }

  return (
    <LoadingScreen isInitialized={isInitialized}>
      <div {...containerProps} className={classNames(className, '')}>
        <PageHeader />
        {children}
      </div>
    </LoadingScreen>
  )
}

export default Layout
