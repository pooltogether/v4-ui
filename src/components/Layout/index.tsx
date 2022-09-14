import React from 'react'
import classNames from 'classnames'
import { PageHeader } from '@components/Layout/PageHeader'
import { Navigation } from './Navigation'
import { AlertBanners } from '@components/AlertBanners'
import { RewardsBanners } from '@components/RewardsBanners'

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
