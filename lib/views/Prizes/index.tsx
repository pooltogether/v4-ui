import React from 'react'

import { useSelectedNetworkDrawPrizes } from 'lib/hooks/Tsunami/DrawPrizes/useSelectedNetworkDrawPrizes'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { PagePadding } from 'lib/components/Layout/PagePadding'
import { DrawPrizeDrawList } from './DrawPrizeDrawList'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { NoAccountPrizeUI } from './NoAccountPrizeUI'
import { HistoricPrizesList } from './HistoricPrizesList'

export const PRIZE_UI_STATES = {
  initialState: 'initialState',
  checkingForPrizes: 'checkingForPrizes',
  won: 'won',
  didNotWin: 'didNotWin'
}

// NOTE:, this is where we are selecting a single DrawPrize from the list
export const PrizesUI = (props) => {
  const { data: drawPrizes, isFetched } = useSelectedNetworkDrawPrizes()
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
    return <NoAccountPrizeUI drawPrize={drawPrizes[0]} prizePool={prizePool} />
  }

  return (
    <>
      <DrawPrizeDrawList drawPrize={drawPrizes[0]} prizePool={prizePool} />
      <PagePadding>
        <HistoricPrizesList drawPrize={drawPrizes[0]} prizePool={prizePool} />
      </PagePadding>
    </>
  )
}

const LoadingCard = () => <div className='w-full rounded-xl animate-pulse bg-card h-112' />
