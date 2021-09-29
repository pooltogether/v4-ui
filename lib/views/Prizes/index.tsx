import { SquareButton } from '@pooltogether/react-components'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SelectedNetworkToggle } from 'lib/components/SelectedNetworkToggle'
import { useSelectedNetworkDrawPrizes } from 'lib/hooks/Tsunami/DrawPrizes/useSelectedNetworkDrawPrizes'
import { DrawPrize, Draw } from '@pooltogether/v4-js-client'
import { useValidDraws } from 'lib/hooks/Tsunami/DrawPrizes/useValidDraws'
import { DrawCard } from './DrawCard'

export const PRIZE_UI_STATES = {
  initialState: 'initialState',
  checkingForPrizes: 'checkingForPrizes',
  won: 'won',
  didNotWin: 'didNotWin'
}

export const PrizesUI = (props) => {
  const { data: drawPrizes, isFetched } = useSelectedNetworkDrawPrizes()
  if (!isFetched) return <LoadingList />
  return (
    <>
      <SelectedNetworkToggle className='mx-auto mb-4' />
      <DrawPrizeDrawsList drawPrize={drawPrizes[0]} />
    </>
  )
}

interface DrawPrizeProps {
  drawPrize: DrawPrize
}

const LoadingList = () => {
  return (
    <div className='flex flex-col w-full space-y-4'>
      {[...Array(3)].map((_, i) => (
        <LoadingCard key={`claimable-draw-loading-${i}`} />
      ))}
    </div>
  )
}

export const LoadingCard = () => <div className='w-full rounded-xl animate-pulse bg-card h-36' />

const DrawPrizeDrawsList = (props: DrawPrizeProps) => {
  const { drawPrize } = props
  // TODO: Fetch the users claimable prizes
  // useUsersClaimablePrizes(drawPrize)
  const { data: draws, isFetched } = useValidDraws(drawPrize)

  // TODO: we should kick off fetching all draw settings here before rendering,
  // as well as claimed prizes
  // Then we can properly render empty states
  const drawsToRender = useMemo(
    () =>
      draws
        ?.sort(sortById)
        .map((draw) => (
          <DrawCard key={`${drawPrize.id()}_${draw.drawId}`} drawPrize={drawPrize} draw={draw} />
        )),
    [draws]
  )

  if (!isFetched) return <LoadingList />

  if (isFetched && draws.length === 0) {
    return <span>No draws yet! Check back soon</span>
  }

  return <div className='space-y-4'>{drawsToRender}</div>
}

const sortById = (a: Draw, b: Draw) => b.drawId - a.drawId
