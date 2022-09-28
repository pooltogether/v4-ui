import { BrowsePrizePoolsHeader } from '@components/BrowsePrizePools/BrowsePrizePoolsHeader'
import { BrowsePrizePoolsList } from '@components/BrowsePrizePools/BrowsePrizePoolsList'
import { TopPrizePools } from '@components/BrowsePrizePools/TopPrizePools'
import { ConnectWalletButton } from '@components/ConnectWalletButton'
import { PagePadding } from '@components/Layout/PagePadding'
import { CardTitle } from '@components/Text/CardTitle'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { ButtonRadius, ButtonSize, ButtonTheme, Tabs } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useIsWalletConnected, useUsersAddress } from '@pooltogether/wallet-connection'
import { AccountCard } from '@views/Account/AccountCard'
import { DepositModal, ViewIds } from '@views/Deposit/DepositTrigger/DepositModal'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { DelegationList } from './DelegationList'
import { OddsDisclaimer } from './OddsDisclaimer'
import { EarnRewardsCard } from './Rewards/EarnRewardsCard'
import { GovernanceSidebarCard } from './SidebarCard/GovernanceSidebarCard'
import { OddsOfWinningWithX, OddsSidebarCard } from './SidebarCard/OddsSidebarCard'
import { PastPrizesSidebarCard } from './SidebarCard/PastPrizesSidebarCard'
import { V3DepositList } from './V3DepositList'
import { V3StakingList } from './V3StakingList'
import { V4DepositList } from './V4DepositList'

export const AccountUI = (props) => {
  const usersAddress = useUsersAddress()

  return (
    <PagePadding
      className='grid gap-4 grid-cols-1 sm:grid-cols-3 md:grid-cols-4 min-h-screen'
      widthClassName='max-w-screen-lg'
      paddingClassName='px-2 xs:px-4 sm:px-8 lg:px-12 pb-20 pt-2 pt-8'
    >
      <MainContent className='sm:col-span-2 md:col-span-3 space-y-4'>
        <HeaderContent>
          <AccountCard usersAddress={usersAddress} />
        </HeaderContent>
        <CardContent>
          <V4DepositList />
          <RewardsHaveMoved />
          <hr className='sm:hidden' />
          <GovernanceSidebarCard usersAddress={usersAddress} className='sm:hidden' />
          <OddsOfWinningWithX className='sm:hidden' />
          <hr className='sm:hidden' />
          <DelegationList />
          <EarnRewardsCard />
          <V3StakingList />
          <V3DepositList />
        </CardContent>
        <OddsDisclaimer className='block mt-6' />
      </MainContent>

      <SidebarContent className=''>
        <PastPrizesSidebarCard usersAddress={usersAddress} />
        <OddsSidebarCard usersAddress={usersAddress} />
        <GovernanceSidebarCard usersAddress={usersAddress} />
      </SidebarContent>
    </PagePadding>
  )
}

const MainContent = (props) => <div {...props} className={props.className} />

/**
 * Handles no wallet state for the account page header
 * @param props
 * @returns
 */
const HeaderContent: React.FC<{ className?: string; children: React.ReactNode }> = (props) => {
  let { children, className, ...remainingProps } = props
  const isWalletConnected = useIsWalletConnected()
  if (!isWalletConnected) {
    children = <NoWalletAccountHeader className='mx-auto xs:mb-12 md:mb-20' />
  }
  return <div {...remainingProps} children={children} className={classNames('w-full', className)} />
}

const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = (props) => {
  let { children, className, ...remainingProps } = props

  const isWalletConnected = useIsWalletConnected()
  if (!isWalletConnected) {
    children = (
      <>
        <BrowsePrizePools />
        <hr className='sm:hidden' />
        <OddsOfWinningWithX className='sm:hidden' />
        <hr className='sm:hidden' />
        <FunWalletConnectionPrompt />
      </>
    )
  }

  return (
    <div
      {...props}
      children={children}
      className={classNames(
        'w-full bg-white bg-opacity-80 dark:bg-pt-purple-darkest py-10 lg:py-12 rounded-xl space-y-12 sm:space-y-16 px-4 sm:px-6 lg:px-12',
        className
      )}
    />
  )
}

const SidebarContent: React.FC<{ className?: string; children: React.ReactNode }> = (props) => {
  let { children, className, ...remainingProps } = props

  return (
    <div
      {...remainingProps}
      children={children}
      className={classNames('hidden sm:flex sm:flex-col space-y-4', className)}
    />
  )
}

const NoWalletAccountHeader: React.FC<{ className?: string }> = (props) => {
  return (
    <div className={classNames('text-center leading-none xs:max-w-lg', props.className)}>
      <div className='mx-auto mt-6 mb-2 flex justify-center'>
        <img src={'/wallet-illustration.png'} className='w-24 h-24 xs:w-38 xs:h-38 ml-4 xs:ml-8' />
      </div>
      <div className='font-bold w-2/3 text-2xl sm:text-4xl mx-auto mb-2'>
        Prize accounts for humans
      </div>
      <div className='font-bold mb-8'>
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

  const onPrizePoolSelect = (prizePool: PrizePool) => {
    setSelectedPrizePoolAddress(prizePool)
    setIsOpen(true)
  }

  return (
    <div className={className}>
      <BrowsePrizePoolsHeader className='mb-12' />
      <Tabs
        titleClassName='mb-8'
        tabs={[
          {
            id: 'all',
            view: <BrowsePrizePoolsList onPrizePoolSelect={onPrizePoolSelect} className='' />,
            title: 'All Pools'
          },
          {
            id: 'top',
            view: (
              <TopPrizePools
                onPrizePoolSelect={onPrizePoolSelect}
                marginClassName='mb-12 px-4 sm:px-6 lg:px-12 -mx-4 sm:-mx-6 lg:-mx-12'
              />
            ),
            title: 'Top Pools'
          }
        ]}
        initialTabId={'top'}
      />
      {/* TODO: Make another modal without the browse view */}
      <DepositModal
        initialViewId={ViewIds.deposit}
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
      />
    </div>
  )
}

export const FunWalletConnectionPrompt: React.FC<{ className?: string }> = (props) => {
  return (
    <div className={classNames('flex flex-col text-center pt-28', props.className)}>
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
    <CardTitle title='Rewards' className='mb-2' />
    <p className='opacity-70 text-xxs xs:text-xs'>
      Claiming rewards has moved!{' '}
      <Link href={'/prizes#rewards'}>
        <a className='transition-opacity hover:opacity-70 h-fit-content items-center'>
          Take me there
          <FeatherIcon
            icon='arrow-up-right'
            className='w-3 h-3 xs:w-4 xs:h-4 ml-1 mb-1 inline-block'
          />
        </a>
      </Link>
    </p>
  </div>
)
