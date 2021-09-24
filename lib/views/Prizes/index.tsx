import { SquareButton } from '@pooltogether/react-components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { SelectedNetworkToggle } from 'lib/components/SelectedNetworkToggle'
import { useSelectedNetworkClaimableDraws } from 'lib/hooks/Tsunami/ClaimableDraws/useSelectedNetworkClaimableDraws'
import { ClaimableDraw } from '.yalc/@pooltogether/v4-js-client/dist'
import { useValidDraws } from 'lib/hooks/Tsunami/ClaimableDraws/useValidDraws'
import { DrawCard } from './DrawCard'

export const PRIZE_UI_STATES = {
  initialState: 'initialState',
  checkingForPrizes: 'checkingForPrizes',
  won: 'won',
  didNotWin: 'didNotWin'
}

export const PrizesUI = (props) => {
  const { data: claimableDraws, isFetched } = useSelectedNetworkClaimableDraws()
  if (!isFetched) return <LoadingList />
  return (
    <>
      <SelectedNetworkToggle className='mx-auto mb-4' />
      <ClaimableDrawDrawsList claimableDraw={claimableDraws[0]} />
    </>
  )
}

interface ClaimableDrawProps {
  claimableDraw: ClaimableDraw
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

const ClaimableDrawDrawsList = (props: ClaimableDrawProps) => {
  const { claimableDraw } = props
  // TODO: Fetch the users claimable prizes
  // useUsersClaimablePrizes(claimableDraw)
  const { data: draws, isFetched } = useValidDraws(claimableDraw)

  if (!isFetched) return <LoadingList />

  return (
    <div className='space-y-4'>
      {draws.reverse().map((draw) => (
        <DrawCard
          key={`${claimableDraw.id()}_${draw.drawId}`}
          claimableDraw={claimableDraw}
          draw={draw}
        />
      ))}
    </div>
  )
}

const ConnectWalletButton = (props) => {
  const { connectWallet } = props
  const { t } = useTranslation()
  return (
    <SquareButton className='w-full mb-8' onClick={connectWallet}>
      {t('connectWallet')}
    </SquareButton>
  )
}
