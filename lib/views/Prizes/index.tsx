import React from 'react'

import { useSelectedNetworkPrizeDistributors } from 'lib/hooks/Tsunami/PrizeDistributor/useSelectedNetworkPrizeDistributors'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { PagePadding } from 'lib/components/Layout/PagePadding'
import { PrizeDistributorDrawList } from './PrizeDistributorDrawList'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { NoAccountPrizeUI } from './NoAccountPrizeUI'
import { HistoricPrizesList } from './HistoricPrizesList'

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

  if (!isFetched || !isPrizePoolFetched) {
    return (
      <PagePadding>
        <LoadingCard />
      </PagePadding>
    )
  }

  if (!usersAddress) {
    return <NoAccountPrizeUI prizeDistributor={prizeDistributors[0]} prizePool={prizePool} />
  }

  return (
    <>
      <PrizeDistributorDrawList prizeDistributor={prizeDistributors[0]} prizePool={prizePool} />
      <PagePadding>
        <HistoricPrizesList prizeDistributor={prizeDistributors[0]} prizePool={prizePool} />
      </PagePadding>
    </>
  )
}

const LoadingCard = () => <div className='w-full rounded-xl animate-pulse bg-card h-112' />
