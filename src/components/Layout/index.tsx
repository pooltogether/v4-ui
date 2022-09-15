import { PageHeader } from '@components/Layout/PageHeader'
import classNames from 'classnames'
import React from 'react'
import { Navigation } from './Navigation'

interface LayoutProps {
  className?: string
  children: React.ReactNode
}

const Layout = (props: LayoutProps) => {
  const { children, className } = props

  return (
    <div className={classNames(className, 'min-h-screen minimal-scrollbar')}>
      <PageHeader />
      <Navigation />
      {/* TODO: Add this back <RewardsBanners /> */}
      {/* <AlertBanners /> */}
      {children}
    </div>
  )
}

export default Layout
