import React from 'react'
import { SelectedNetworkToggle } from 'lib/components/SelectedNetworkToggle'
import { useSelectedNetworkDrawPrizes } from 'lib/hooks/Tsunami/DrawPrizes/useSelectedNetworkDrawPrizes'
import { DrawPrize, PrizePool } from '@pooltogether/v4-js-client'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { PagePadding } from 'lib/components/Layout/PagePadding'
import { DrawPrizeDrawList } from './DrawPrizeDrawList'

export const PRIZE_UI_STATES = {
  initialState: 'initialState',
  checkingForPrizes: 'checkingForPrizes',
  won: 'won',
  didNotWin: 'didNotWin'
}

// TODO: Note, this is where we are selecting a single DrawPrize from the list
export const PrizesUI = (props) => {
  const { data: drawPrizes, isFetched } = useSelectedNetworkDrawPrizes()
  const { data: prizePool, isFetched: isPrizePoolFetched } = useSelectedNetworkPrizePool()
  if (!isFetched || !isPrizePoolFetched)
    return (
      <PagePadding>
        <LoadingCard />
      </PagePadding>
    )
  return (
    <>
      <SelectedNetworkToggle className='mx-auto mb-8' />
      <DrawPrizeDrawList drawPrize={drawPrizes[0]} prizePool={prizePool} />
    </>
  )
}

const LoadingCard = () => <div className='w-full rounded-xl animate-pulse bg-card h-128' />
