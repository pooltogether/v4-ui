import { SquareButton } from '@pooltogether/react-components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { SelectedNetworkToggle } from 'lib/components/SelectedNetworkToggle'
import { useSelectedNetworkDrawPrizes } from 'lib/hooks/Tsunami/DrawPrizes/useSelectedNetworkDrawPrizes'
import { DrawPrize, Draw } from '.yalc/@pooltogether/v4-js-client/dist'
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

  if (!isFetched) return <LoadingList />

  return (
    <div className='space-y-4'>
      {draws.sort(sortById).map((draw) => (
        <DrawCard key={`${drawPrize.id()}_${draw.drawId}`} drawPrize={drawPrize} draw={draw} />
      ))}
    </div>
  )
}

const sortById = (a: Draw, b: Draw) => b.drawId - a.drawId

const ConnectWalletButton = (props) => {
  const { connectWallet } = props
  const { t } = useTranslation()
  return (
    <SquareButton className='w-full mb-8' onClick={connectWallet}>
      {t('connectWallet')}
    </SquareButton>
  )
}
