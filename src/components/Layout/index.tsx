import { PageHeader } from '@components/Layout/PageHeader'
import classNames from 'classnames'
import React from 'react'
import { Navigation } from './Navigation'

interface LayoutProps {
  className?: string
  backgroundClassName?: string
  children: React.ReactNode
}

const Layout = (props: LayoutProps) => {
  const { children, className, backgroundClassName } = props

  return (
    <div
      className={classNames(
        className,
        backgroundClassName,
        'min-h-actually-full-screen minimal-scrollbar'
      )}
    >
      <PageHeader />
      <Navigation />
      {/* <AlertBanners /> */}
      {children}
    </div>
  )
}

// Layout.defaultProps = {
//   backgroundClassName:
//     'bg-gradient-to-br from-pt-purple-lightest to-pt-purple-lighter dark:from-gradient-purple dark:to-pt-purple-darkest minimal-scrollbar'
// }

export default Layout
