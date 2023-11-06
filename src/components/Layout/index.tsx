import { PageHeader } from '@components/Layout/PageHeader'
import classNames from 'classnames'
import React, { useEffect, ReactNode } from 'react'
import { Navigation } from './Navigation'
import { ExternalLink } from '@pooltogether/react-components'

/**
 * Sonner Toasts
 */
import { toast } from 'sonner'

interface LayoutProps {
  className?: string
  backgroundClassName?: string
  children: React.ReactNode
}

const Layout = (props: LayoutProps) => {
  const { children, className, backgroundClassName } = props

  useEffect(() => {
    temporaryAlerts.forEach((alert) => {
      toast(alert.content, { id: alert.id })
    })
  })

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

const temporaryAlerts: { id: string; content: ReactNode }[] = [
  {
    id: 'aave-issues-04-11-2023',
    content: (
      <span className='flex flex-col items-center text-center text-xxs'>
        Aave has temporarily paused deposits and withdrawals on some assets until{' '}
        <ExternalLink
          href='https://app.aave.com/governance/proposal/?proposalId=358'
          className='text-pt-teal transition hover:opacity-90 underline'
          underline
        >
          proposal 358
        </ExternalLink>{' '}
        passes, due to a security issue. While no funds are at risk, the Prize USDC.e and Prize DAI
        vaults will be unavailable in the meantime. Aave is currently evaluating a security issue.
        Deposits will be paused for Prize USDC.e and Prize DAI until further updates. No funds are
        at risk.{' '}
      </span>
    )
  }
]
