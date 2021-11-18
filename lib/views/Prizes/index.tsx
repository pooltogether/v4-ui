import React from 'react'

import { useSelectedNetworkPrizeDistributors } from 'lib/hooks/Tsunami/PrizeDistributor/usePrizeDistributorBySelectedNetwork'
import { usePrizePoolBySelectedNetwork } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolBySelectedNetwork'
import { SelectedNetworkToggle } from 'lib/components/SelectedNetworkToggle'
import { PagePadding } from 'lib/components/Layout/PagePadding'
import { PrizeDistributorDrawList } from './PrizeDistributorDrawList'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { NoAccountPrizeUI } from './NoAccountPrizeUI'
import { PastDrawsList } from './PastDrawsList'
import { usePrizeDistributorBySelectedNetwork } from 'lib/hooks/Tsunami/PrizeDistributor/usePrizeDistributorBySelectedNetwork'
import { PrizeChecker } from './PrizeChecker.tsx'

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
      <PagePadding>
        <SelectedNetworkToggleWithPadding />
        <LoadingCard />
      </PagePadding>
    )
  }

  if (!usersAddress) {
    return <NoAccountPrizeUI prizeDistributor={prizeDistributor} prizePool={prizePool} />
  }

  return (
    <>
      <PagePadding>
        {/* <PrizeDistributorDrawList prizeDistributor={prizeDistributor} prizePool={prizePool} /> */}
        <PrizeChecker prizeDistributor={prizeDistributor} prizePool={prizePool} />
        {/* <PastDrawsList prizeDistributor={prizeDistributor} prizePool={prizePool} /> */}
      </PagePadding>
    </>
  )
}

const SelectedNetworkToggleWithPadding = () => (
  <div className='mb-4 mx-auto text-center max-w-max'>
    <SelectedNetworkToggle />
  </div>
)

const LoadingCard = () => (
  <div className='w-full rounded-xl animate-pulse bg-card mb-4 h-48 xs:h-112' />
)
