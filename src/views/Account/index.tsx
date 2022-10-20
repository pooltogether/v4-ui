import { BrowsePrizePoolsHeader } from '@components/BrowsePrizePools/BrowsePrizePoolsHeader'
import { PrizePoolsTable } from '@components/BrowsePrizePools/PrizePoolsTable'
import { RecommendedPrizePools } from '@components/BrowsePrizePools/RecommendedPrizePools'
import { ConnectWalletButton } from '@components/ConnectWalletButton'
import { PagePadding } from '@components/Layout/PagePadding'
import { DepositModal, ViewIds } from '@components/Modal/DepositModal'
import { CardTitle } from '@components/Text/CardTitle'
import { URL_QUERY_KEY } from '@constants/urlQueryKeys'
import { useQueryParamState } from '@hooks/useQueryParamState'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import {
  ButtonRadius,
  ButtonSize,
  ButtonTheme,
  ExternalLink,
  SocialIcon,
  SocialKey,
  Tabs
} from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useIsWalletConnected, useUsersAddress } from '@pooltogether/wallet-connection'
import { AccountCard } from '@views/Account/AccountCard'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'
import { useState } from 'react'
import { DelegationList } from './DelegationList'
import { OddsDisclaimer } from './OddsDisclaimer'
import { EarnRewardsCard } from './Rewards/EarnRewardsCard'
import { RewardsCard } from './Rewards/RewardsCard'
import { GovernanceSidebarCard } from './SidebarCard/GovernanceSidebarCard'
import { OddsOfWinningWithX, OddsSidebarCard } from './SidebarCard/OddsSidebarCard'
import { PastPrizesSidebarCard } from './SidebarCard/PastPrizesSidebarCard'
import { V3DepositList } from './V3DepositList'
import { V3StakingList } from './V3StakingList'
import { V4DepositList } from './V4DepositList'

export const AccountUI = (props) => {
  const isWalletConnected = useIsWalletConnected()
  const usersAddress = useUsersAddress()

  if (!isWalletConnected) {
    return (
      <PagePadding>
        <NoWalletAccountHeader className='mx-auto mb-20 max-w-screen-sm' />
        <Card className='max-w-screen-md mx-auto'>
          <BrowsePrizePools />
          <OddsOfWinningWithX bgClassName='bg-transparent' />
          <FunWalletConnectionPrompt className='max-w-screen-sm mx-auto' />
        </Card>
      </PagePadding>
    )
  }
  return (
    <PagePadding className='grid gap-4 grid-cols-1 sm:grid-cols-3 md:grid-cols-4'>
      <div className='sm:col-span-2 md:col-span-3 space-y-4'>
        <AccountCard usersAddress={usersAddress} />
        <Card>
          <V4DepositList />
          <DelegationList />
          <Rewards />
          <hr className='sm:hidden' />
          <GovernanceSidebarCard usersAddress={usersAddress} className='sm:hidden' />
          <OddsOfWinningWithX className='sm:hidden' />
          <EarnRewardsCard className='sm:hidden' />
          <hr className='sm:hidden' />
          <V3StakingList />
          <V3DepositList />
        </Card>
        <OddsDisclaimer className='block mt-6' />
      </div>

      <SidebarContent className=''>
        <PastPrizesSidebarCard usersAddress={usersAddress} />
        <OddsSidebarCard usersAddress={usersAddress} />
        <GovernanceSidebarCard usersAddress={usersAddress} />
        <EarnRewardsCard />
        <SocialLinks />
      </SidebarContent>
    </PagePadding>
  )
}

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = (props) => {
  let { children, className, ...remainingProps } = props

  return (
    <div
      {...props}
      children={children}
      className={classNames(
        'w-full bg-white bg-opacity-100 dark:bg-actually-black dark:bg-opacity-40 py-10 lg:py-12 rounded-xl space-y-12 sm:space-y-16 px-4 sm:px-6 lg:px-12',
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
    <div className={classNames('text-center leading-none', props.className)}>
      <div className='mx-auto mt-6 mb-2 sm:mb-4 flex justify-center'>
        <img
          src={'/wallet-illustration.png'}
          className='w-24 h-24 xs:w-38 xs:h-38 sm:w-44 sm:h-44 ml-4 xs:ml-8'
        />
      </div>
      <div className='font-bold w-2/3 text-2xl sm:text-4xl lg:text-6xl mx-auto mb-2'>
        Prize savings for humans
      </div>
      <div className='font-bold mb-8 sm:mb-12'>
        Open to all, free forever. No banks, no stress, just prizes.
      </div>
      <ConnectWalletButton
        theme={ButtonTheme.transparent}
        radius={ButtonRadius.full}
        size={ButtonSize.xl}
        className='mb-2 xs:mb-4 lg:mb-6 mx-auto w-full xs:w-3/4'
      />
      <ExternalLink
        className='opacity-75 text-xxs lg:text-xs'
        href='https://docs.ethhub.io/using-ethereum/wallets/intro-to-ethereum-wallets/'
      >
        {`What's a wallet?`}
      </ExternalLink>
    </div>
  )
}

export const BrowsePrizePools: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const [isOpen, setIsOpen] = useState(false)
  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()

  const onPrizePoolSelect = async (prizePool: PrizePool) => {
    setSelectedPrizePoolAddress(prizePool)
    await setIsOpen(true)
  }

  const { data: initialTabId, setData } = useQueryParamState(URL_QUERY_KEY.exploreView, 'all', [
    'all',
    'top'
  ])

  return (
    <div className={className}>
      <BrowsePrizePoolsHeader className='mb-12' />
      <Tabs
        titleClassName='mb-8'
        tabs={[
          {
            id: 'all',
            view: <PrizePoolsTable onPrizePoolSelect={onPrizePoolSelect} className='' />,
            title: 'Prize Pools'
          },
          {
            id: 'top',
            view: <RecommendedPrizePools onPrizePoolSelect={onPrizePoolSelect} />,
            title: 'Recommendations'
          }
        ]}
        initialTabId={'all'}
      />
      <DepositModal isOpen={isOpen} closeModal={() => setIsOpen(false)} />
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
        className='xs:max-w-3/4 w-full mx-auto mb-2 xs:mb-4 lg:mb-6'
        theme={ButtonTheme.pink}
        radius={ButtonRadius.full}
        // size={ButtonSize.xl}
      />
      <ExternalLink
        className='opacity-75 text-xxs lg:text-xs'
        href='https://docs.ethhub.io/using-ethereum/wallets/intro-to-ethereum-wallets/'
      >
        {`What's a wallet?`}
      </ExternalLink>
    </div>
  )
}

const Rewards = () => (
  <div className=''>
    <CardTitle title={'Bonus Rewards'} className='mb-2' />
    <RewardsCard />
    {/* <p className='opacity-70 text-xxs xs:text-xs'>
      Claiming rewards has moved!{' '}
      <Link href={'/prizes#rewards'}>
        <a className='transition-opacity underline hover:opacity-70 h-fit-content items-center'>
          Take me there
          <FeatherIcon
            icon='arrow-up-right'
            className='w-3 h-3 xs:w-4 xs:h-4 ml-1 mb-1 inline-block'
          />
        </a>
      </Link>
    </p> */}
  </div>
)

const SocialLinks = () => {
  return (
    <div className='flex justify-evenly items-center dark:opacity-50' style={{ color: '#BBB2CE' }}>
      <a href={'https://pooltogether.com/discord'}>
        <SocialIcon social={SocialKey.discord} className='w-6 h-6' />
      </a>
      <a href={'https://twitter.com/PoolTogether_'}>
        <SocialIcon social={SocialKey.twitter} className='w-6 h-6' />
      </a>
      <a href={'https://github.com/pooltogether'}>
        <SocialIcon social={SocialKey.github} className='w-6 h-6' />
      </a>
      <a href={'https://docs.pooltogether.com/welcome/getting-started'}>
        <FeatherIcon icon='info' className='w-6 h-6' />
      </a>
    </div>
  )
}
