import React from 'react'

import { useSelectedNetworkPrizeDistributors } from 'lib/hooks/Tsunami/PrizeDistributor/useSelectedNetworkPrizeDistributors'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { SelectedNetworkToggle } from 'lib/components/SelectedNetworkToggle'
import { PagePadding } from 'lib/components/Layout/PagePadding'
import { PrizeDistributorDrawList } from './PrizeDistributorDrawList'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { NoAccountPrizeUI } from './NoAccountPrizeUI'
import { HistoricPrizesList } from './HistoricPrizesList'
import { useDrawUnlockTime } from 'lib/hooks/Tsunami/PrizeDistributor/useDrawUnlockTime'

export const PRIZE_UI_STATES = {
  initialState: 'initialState',
  checkingForPrizes: 'checkingForPrizes',
  won: 'won',
  didNotWin: 'didNotWin'
}

// NOTE:, this is where we are selecting a single PrizeDistributor from the list
export const PrizesUI = () => {
  const { data: prizeDistributors, isFetched } = useSelectedNetworkPrizeDistributors()
  const { data: prizePool, isFetched: isPrizePoolFetched } = useSelectedNetworkPrizePool()
  const usersAddress = useUsersAddress()

  useDrawUnlockTime()

  if (!isFetched || !isPrizePoolFetched) {
    return (
      <PagePadding>
        <SelectedNetworkToggleWithPadding />
        <LoadingCard />
      </PagePadding>
    )
  }

  if (!usersAddress) {
    return (
      <>
        <SelectedNetworkToggleWithPadding />
        <NoAccountPrizeUI prizeDistributor={prizeDistributors[0]} prizePool={prizePool} />
      </>
    )
  }

  return (
    <>
      <SelectedNetworkToggleWithPadding />
      <PrizeDistributorDrawList prizeDistributor={prizeDistributors[0]} prizePool={prizePool} />
      <PagePadding>
        <HistoricPrizesList prizeDistributor={prizeDistributors[0]} prizePool={prizePool} />
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
