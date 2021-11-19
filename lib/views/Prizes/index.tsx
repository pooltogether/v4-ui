import React from 'react'

import { usePrizePoolBySelectedNetwork } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolBySelectedNetwork'
import { SelectedNetworkToggle } from 'lib/components/SelectedNetworkToggle'
import { PagePadding } from 'lib/components/Layout/PagePadding'
import { PrizeDistributorDrawList } from './PrizeDistributorDrawList'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { NoAccountPrizeUI } from './NoAccountPrizeUI'
import { PastDrawsList } from './PastDrawsList'
import { usePrizeDistributorBySelectedNetwork } from 'lib/hooks/Tsunami/PrizeDistributor/usePrizeDistributorBySelectedNetwork'
import { PrizeChecker } from './PrizeChecker.tsx'
import { PrizeDistributor, PrizePool } from '@pooltogether/v4-js-client'
import { useTranslation } from 'react-i18next'
import { SelectedNetworkDropdown } from 'lib/components/SelectedNetworkDropdown'
import { MultiDrawsCard } from './MultiDrawsCard'
import { PrizeWLaurels } from 'lib/components/Images/PrizeWithLaurels'
import { ConnectWalletCard } from 'lib/components/ConnectWalletCard'
import classNames from 'classnames'
import { LoadingCard } from './MultiDrawsCard/LoadingCard'

export const PRIZE_UI_STATES = {
  initialState: 'initialState',
  checkingForPrizes: 'checkingForPrizes',
  won: 'won',
  didNotWin: 'didNotWin'
}

export const PrizesUI = () => {
  const prizeDistributor = usePrizeDistributorBySelectedNetwork()
  const prizePool = usePrizePoolBySelectedNetwork()
  const usersAddress = useUsersAddress()

  if (!Boolean(prizeDistributor) || !prizePool) {
    return (
      <PagePadding className='flex flex-col space-y-6'>
        <CheckForPrizesOnNetwork prizePool={prizePool} prizeDistributor={prizeDistributor} />
        <LoadingCard />
      </PagePadding>
    )
  }

  if (!usersAddress) {
    return (
      <PagePadding className='flex flex-col space-y-6'>
        <PrizeWLaurels className='mx-auto' />
        <ConnectWalletCard />
        <CheckForPrizesOnNetwork prizePool={prizePool} prizeDistributor={prizeDistributor} />
        {/* <PastDrawsList {...props} /> */}
      </PagePadding>
    )
  }

  return (
    <>
      <PagePadding className='flex flex-col space-y-6'>
        <CheckForPrizesOnNetwork prizePool={prizePool} prizeDistributor={prizeDistributor} />
        <MultiDrawsCard prizePool={prizePool} prizeDistributor={prizeDistributor} />
        {/* <PastDrawsList prizeDistributor={prizeDistributor} prizePool={prizePool} /> */}
      </PagePadding>
    </>
  )
}
const CheckForPrizesOnNetwork = (props: {
  className?: string
  prizePool: PrizePool
  prizeDistributor: PrizeDistributor
}) => {
  const { className } = props
  const { t } = useTranslation()
  return (
    <div
      className={classNames(
        'font-semibold font-inter flex items-center justify-center text-xs xs:text-sm sm:text-lg',
        className
      )}
    >
      <span>{t('prizesOn', 'Prizes on')}</span>
      <SelectedNetworkDropdown className='network-dropdown ml-1 xs:ml-2' />
    </div>
  )
}
