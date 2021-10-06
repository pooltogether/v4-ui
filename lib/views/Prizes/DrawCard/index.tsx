import { Token, useTransaction } from '@pooltogether/hooks'
import { Card, SquareButton, ThemedClipSpinner } from '@pooltogether/react-components'
import { DrawPrize, Draw, PrizeDistribution, DrawResults } from '@pooltogether/v4-js-client'
import { useUsersDrawResult } from 'lib/hooks/Tsunami/DrawPrizes/useUsersDrawResult'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import React, { useEffect, useState } from 'react'
import { PrizeAnimation } from 'lib/views/Prizes/DrawCard/PrizeAnimation'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { PrizeClaimModal } from './PrizeClaimModal'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useTranslation } from 'react-i18next'
import { useStoredDrawResult } from 'lib/hooks/Tsunami/useStoredDrawResult'
import { StoredDrawStates } from 'lib/utils/drawResultsStorage'
import { DrawDetails } from './DrawDetails'
import FeatherIcon from 'feather-icons-react'

interface DrawCardProps {
  prizeDistribution: PrizeDistribution
  drawPrize: DrawPrize
  draw: Draw
  hideDrawCard: () => void
  refetchUsersBalances: () => void
}

export interface DrawPropsWithDetails extends DrawCardProps {
  token: Token
  ticket: Token
}

export const DrawCard = (props: DrawCardProps) => {
  const { prizeDistribution } = props
  const { data: prizePool } = useSelectedNetworkPrizePool()
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)

  if (!isPrizePoolTokensFetched) {
    return <LoadingCard />
  }

  return (
    <Card className='relative'>
      <div className='flex flex-col space-y-4'>
        <DrawDetails
          {...props}
          prizeDistribution={prizeDistribution}
          token={prizePoolTokens.token}
        />
        <DrawClaimSection
          {...props}
          prizeDistribution={prizeDistribution}
          token={prizePoolTokens.token}
          ticket={prizePoolTokens.ticket}
        />
      </div>
    </Card>
  )
}

//////////////////// Draw claim ////////////////////

// TODO: set claim section state should push into the animation queue with a callback, that then executes the claim section change
export enum ClaimState {
  loading,
  unchecked,
  checking,
  unclaimed,
  claimed
}

const DrawClaimSection = (props: DrawPropsWithDetails) => {
  const { drawPrize, draw, hideDrawCard } = props
  const [claimState, setClaimState] = useState<ClaimState>(ClaimState.unchecked)
  const [hasCheckedAnimationFinished, setHasCheckedAnimationFinished] = useState<boolean>(false)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const [txId, setTxId] = useState(0)
  const sendTx = useSendTransaction()
  const claimTx = useTransaction(txId)

  const { data: fetchedDrawResults, isFetched: isDrawResultsFetched } = useUsersDrawResult(
    drawPrize,
    draw,
    claimState !== ClaimState.checking
  )
  const [resultsState, storedDrawResults] = useStoredDrawResult(drawPrize, draw.drawId)

  const drawResults = fetchedDrawResults || (storedDrawResults as DrawResults)

  useEffect(() => {
    if (claimState === ClaimState.checking && isDrawResultsFetched && hasCheckedAnimationFinished) {
      setClaimState(ClaimState.unclaimed)
    }
  }, [drawResults, isDrawResultsFetched, hasCheckedAnimationFinished])

  useEffect(() => {
    if (claimState === ClaimState.unchecked) {
      if (resultsState === StoredDrawStates.unclaimed) {
        setClaimState(ClaimState.unclaimed)
      } else if (resultsState === StoredDrawStates.claimed) {
        setClaimState(ClaimState.claimed)
      }
    }
  }, [resultsState, storedDrawResults])

  return (
    <>
      {claimState === ClaimState.unclaimed && drawResults.totalValue.isZero() && (
        <HideCardButton hideDrawCard={hideDrawCard} />
      )}
      <PrizeAnimation
        isDrawResultsFetched={isDrawResultsFetched}
        setCheckedAnimationFinished={() => setHasCheckedAnimationFinished(true)}
        totalPrizeValueUnformatted={drawResults?.totalValue}
        claimState={claimState}
      />
      <DrawClaimButton
        {...props}
        hasCheckedAnimationFinished={hasCheckedAnimationFinished}
        drawResults={drawResults}
        claimState={claimState}
        setClaimState={setClaimState}
        openModal={() => setIsModalOpen(true)}
      />
      <PrizeClaimModal
        {...props}
        setTxId={setTxId}
        claimTx={claimTx}
        sendTx={sendTx}
        drawResults={drawResults}
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
      />
    </>
  )
}

const HideCardButton = (props: { hideDrawCard: () => void }) => (
  <FeatherIcon
    icon='x'
    className='absolute top-0 right-4 w-6 h-6 opacity-75 hover:opacity-100 transition-opacity cursor-pointer'
    onClick={props.hideDrawCard}
  />
)

interface DrawClaimButtonProps extends DrawPropsWithDetails {
  hasCheckedAnimationFinished: boolean
  claimState: ClaimState
  drawResults: DrawResults
  setClaimState: (state: ClaimState) => void
  openModal: () => void
}

const DrawClaimButton = (props: DrawClaimButtonProps) => {
  const { claimState, setClaimState, openModal, drawResults, hasCheckedAnimationFinished } = props
  const usersAddress = useUsersAddress()

  const { t } = useTranslation()

  if (!usersAddress) {
    return null
  } else if ([ClaimState.unchecked, ClaimState.checking].includes(claimState)) {
    const isChecking = claimState === ClaimState.checking
    return (
      <SquareButton onClick={() => setClaimState(ClaimState.checking)} disabled={isChecking}>
        {isChecking ? (
          <>
            <ThemedClipSpinner sizeClassName='w-4 h-4' className='mr-2' />
            <span>Checking for prizes</span>
          </>
        ) : (
          <span>Check for prizes</span>
        )}
      </SquareButton>
    )
  } else if (claimState === ClaimState.unclaimed && !drawResults.totalValue.isZero()) {
    return <SquareButton onClick={() => openModal()}>{t('viewPrizes', 'View prizes')}</SquareButton>
  }

  return <SquareButton disabled>{t('noPrizes', 'No prizes')}</SquareButton>
}

const LoadingCard = () => <div className='w-full rounded-xl animate-pulse bg-card h-128' />
