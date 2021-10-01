import { SquareButton } from '@pooltogether/react-components'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SelectedNetworkToggle } from 'lib/components/SelectedNetworkToggle'
import { useSelectedNetworkDrawPrizes } from 'lib/hooks/Tsunami/DrawPrizes/useSelectedNetworkDrawPrizes'
import { DrawPrize, Draw, PrizePool } from '@pooltogether/v4-js-client'
import { useUnclaimedDraws } from 'lib/hooks/Tsunami/DrawPrizes/useUnclaimedDraws'
import { DrawCard } from './DrawCard'
import { useUsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { DrawCarousel } from './DrawCarousel'
import { getPrettyDate } from 'lib/utils/getNextDraw'
import { useNextDraw } from 'lib/hooks/Tsunami/useNextDraw'

export const PRIZE_UI_STATES = {
  initialState: 'initialState',
  checkingForPrizes: 'checkingForPrizes',
  won: 'won',
  didNotWin: 'didNotWin'
}

export const PrizesUI = (props) => {
  const { data: drawPrizes, isFetched } = useSelectedNetworkDrawPrizes()
  const { data: prizePool, isFetched: isPrizePoolFetched } = useSelectedNetworkPrizePool()
  if (!isFetched || !isPrizePoolFetched) return <LoadingCard />
  return (
    <>
      <SelectedNetworkToggle className='mx-auto mb-4' />
      <DrawPrizeDrawsList drawPrize={drawPrizes[0]} prizePool={prizePool} />
    </>
  )
}

interface DrawPrizeProps {
  drawPrize: DrawPrize
  prizePool: PrizePool
}

export const LoadingCard = () => <div className='w-full rounded-xl animate-pulse bg-card h-128' />

const DrawPrizeDrawsList = (props: DrawPrizeProps) => {
  const { drawPrize, prizePool } = props
  const { data: draws, isFetched } = useUnclaimedDraws(drawPrize)
  const { refetch: refetchUsersBalances } = useUsersPrizePoolBalances(prizePool)
  const [drawIdsToHide, setDrawIdsToHide] = useState([])
  const nextDraw = useNextDraw()

  const drawsToRender = useMemo(
    () => draws.filter((draw) => !drawIdsToHide.includes(draw.drawId)),
    [draws, drawIdsToHide]
  )

  if (!isFetched) return <LoadingCard />

  if (isFetched && draws.length === 0) {
    return (
      <div>
        <span>No draws to check!</span>
        <span>{getPrettyDate(nextDraw)}</span>
      </div>
    )
  }

  return (
    <DrawCarousel>
      {drawsToRender.map((draw) => (
        <DrawCard
          key={`${drawPrize.id()}_${draw.drawId}`}
          drawPrize={drawPrize}
          draw={draw}
          hideDrawCard={() => setDrawIdsToHide((drawsToHide) => [...drawsToHide, draw.drawId])}
          refetchUsersBalances={refetchUsersBalances}
        />
      ))}
    </DrawCarousel>
  )
}

const sortById = (a: Draw, b: Draw) => b.drawId - a.drawId
