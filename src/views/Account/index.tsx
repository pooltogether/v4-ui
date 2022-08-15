import React, { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import WalletIllustration from '@assets/images/wallet-illustration.png'
import { PagePadding } from '@components/Layout/PagePadding'
import { AccountCard } from '@views/Account/AccountCard'
import { OddsDisclaimer } from './OddsDisclaimer'
import { V4DepositList } from './V4DepositList'
import { V3DepositList } from './V3DepositList'
import { V3StakingList } from './V3StakingList'
import classNames from 'classnames'
import { PastPrizesSidebarCard } from './PastPrizesSidebarCard'
import { GovernanceSidebarCard } from './GovernanceSidebarCard'
import { DoMoreWithPool } from './DoMoreWithPool'
import { DelegationList } from './DelegationList'
import { useIsWalletConnected, useUsersAddress } from '@pooltogether/wallet-connection'
import { ConnectWalletButton } from '@components/ConnectWalletButton'
import { ButtonRadius, ButtonSize, ButtonTheme, Tabs } from '@pooltogether/react-components'
import { TopPoolsHorizontalList } from '@components/BrowsePrizePools/TopPoolsHorizontalList'
import { BrowsePrizePoolsHeader } from '@components/BrowsePrizePools/BrowsePrizePoolsHeader'
import { BrowsePrizePoolsList } from '@components/BrowsePrizePools/BrowsePrizePoolsList'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { PrizePool } from '@pooltogether/v4-client-js'
import { EarnRewardsCard } from './Rewards/EarnRewardsCard'
import { RewardsCard } from './Rewards/RewardsCard'
import { CardTitle } from '@components/Text/CardTitle'
import Link from 'next/link'

export const AccountUI = (props) => {
  const usersAddress = useUsersAddress()

  return (
    <PagePadding
      className=''
      widthClassName='max-w-screen-lg'
      paddingClassName='px-2 xs:px-4 sm:px-8 lg:px-12 pb-20'
    >
      <div className='flex flex-row'>
        <MainContent>
          <HeaderContent className='mb-8'>
            <AccountCard usersAddress={usersAddress} />
          </HeaderContent>
          <CardContent>
            <V4DepositList />
            <RewardsHaveMoved />
            <hr />
            <DelegationList />
            <EarnRewardsCard className='w-full sm:hidden flex flex-col space-y-2' />
            <V3StakingList />
            <V3DepositList />
          </CardContent>
          <OddsDisclaimer className='block mt-6' />
        </MainContent>

        <SidebarContent>
          <PastPrizesSidebarCard />
          <GovernanceSidebarCard />
          <EarnRewardsCard />
        </SidebarContent>
      </div>
    </PagePadding>
  )
}

const MainContent = (props) => <div {...props} className='w-full' />

/**
 * Handles no wallet state for the account page header
 * @param props
 * @returns
 */
const HeaderContent: React.FC<{ className?: string }> = (props) => {
  let { children, className, ...remainingProps } = props
  const isWalletConnected = useIsWalletConnected()
  if (!isWalletConnected) {
    children = <NoWalletAccountHeader className='mx-auto' />
  }
  return <div {...remainingProps} children={children} className={classNames('w-full', className)} />
}

const CardContent: React.FC<{ className?: string }> = (props) => {
  let { children, className, ...remainingProps } = props

  const isWalletConnected = useIsWalletConnected()
  if (!isWalletConnected) {
    children = <BrowsePrizePools />
  }

  return (
    <div
      {...props}
      children={children}
      className={classNames(
        'w-full bg-white bg-opacity-80 dark:bg-pt-purple-darkest py-10 lg:py-12 rounded-xl space-y-8 px-4 sm:px-6 lg:px-12',
        className
      )}
    />
  )
}

const SidebarContent: React.FC<{ className?: string }> = (props) => {
  let { children, className, ...remainingProps } = props

  return (
    <div
      {...remainingProps}
      children={children}
      className={classNames(
        'w-full pl-4 pr-2 hidden sm:flex max-w-xs flex-col space-y-4',
        className
      )}
    />
  )
}

const NoWalletAccountHeader: React.FC<{ className?: string }> = (props) => {
  return (
    <div className={classNames('text-center leading-none xs:max-w-lg', props.className)}>
      <img
        src={WalletIllustration}
        style={{ width: '65px', height: '60px' }}
        className='mx-auto mb-2'
      />
      <div className='font-bold w-2/3 text-2xl sm:text-4xl mx-auto mb-2'>
        Prize accounts for humans
      </div>
      <div className='font-bold mb-6'>
        Open to all, free forever. No banks, no stress, just prizes.
      </div>
      <ConnectWalletButton
        theme={ButtonTheme.transparent}
        radius={ButtonRadius.full}
        size={ButtonSize.lg}
      />
    </div>
  )
}

const BrowsePrizePools: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const [isOpen, setIsOpen] = useState(false)
  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()

  const selectPrizePool = (prizePool: PrizePool) => {
    setSelectedPrizePoolAddress(prizePool.address)
    setIsOpen(true)
  }

  return (
    <div className={classNames(className, '')}>
      <BrowsePrizePoolsHeader className='mb-12' />
      <Tabs
        className='mb-28'
        titleClassName='mb-8'
        tabs={[
          {
            id: 'top',
            view: (
              <TopPoolsHorizontalList
                selectPrizePool={selectPrizePool}
                marginClassName='mb-12 px-4 sm:px-6 lg:px-12 -mx-4 sm:-mx-6 lg:-mx-12'
              />
            ),
            title: 'Top Pools'
          },
          {
            id: 'all',
            view: <BrowsePrizePoolsList selectPrizePool={selectPrizePool} className='' />,
            title: 'All Pools'
          }
        ]}
        initialTabId={'top'}
      />
      <FunWalletConnectionPrompt />
    </div>
  )
}

const FunWalletConnectionPrompt: React.FC<{ className?: string }> = (props) => {
  return (
    <div className={classNames('flex flex-col text-center', props.className)}>
      <span className='text-9xl filter grayscale'>🩲</span>
      <span className='text-lg opacity-70 leading-tight mb-6 max-w-xs mx-auto'>
        Whoa there partner, swimsuits required beyond this point!
      </span>
      <ConnectWalletButton
        className='max-w-lg w-full mx-auto'
        theme={ButtonTheme.pink}
        radius={ButtonRadius.full}
      />
    </div>
  )
}

const RewardsHaveMoved = () => (
  <div className=''>
    <CardTitle title='Rewards' />
    <p className='opacity-70 text-xs'>
      Claiming rewards has moved!
      <Link href={'/prizes'}>
        <a className='transition-opacity text-xs hover:opacity-70 inline-block h-fit-content items-center'>
          Take me there
          <FeatherIcon icon='arrow-up-right' className='w-4 h-4 ml-1 mb-1 inline-block' />
        </a>
      </Link>
    </p>
  </div>
)
