import React, { useEffect, useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import { Token, Transaction, useTransaction } from '@pooltogether/hooks'
import { Card, SquareButton, ThemedClipSpinner } from '@pooltogether/react-components'
import { PrizeDistributor, Draw, PrizeDistribution, DrawResults } from '@pooltogether/v4-js-client'

import { useUsersDrawResult } from 'lib/hooks/Tsunami/PrizeDistributor/useUsersDrawResult'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { PrizeVideoBackground } from 'lib/views/Prizes/DrawCard/PrizeVideo/PrizeVideoBackground'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { PrizeClaimModal } from './PrizeClaimModal'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useTranslation } from 'react-i18next'
import { useStoredDrawResult } from 'lib/hooks/Tsunami/useStoredDrawResult'
import { StoredDrawStates } from 'lib/utils/drawResultsStorage'
import { DrawDetails } from './DrawDetails'

interface DrawCardProps {
  prizeDistribution: PrizeDistribution
  prizeDistributor: PrizeDistributor
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
    <Card className='draw-card relative'>
      {/* style={{ height: 436 }} */}
      <div className='flex flex-col'>
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
  const { prizeDistributor, draw, hideDrawCard } = props
  const [claimState, setClaimState] = useState<ClaimState>(ClaimState.unchecked)
  const [hasCheckedAnimationFinished, setHasCheckedAnimationFinished] = useState<boolean>(false)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const [txId, setTxId] = useState(0)
  const sendTx = useSendTransaction()
  const claimTx = useTransaction(txId)

  const { data: fetchedDrawResults, isFetched: isDrawResultsFetched } = useUsersDrawResult(
    prizeDistributor,
    draw,
    claimState !== ClaimState.checking
  )
  const [resultsState, storedDrawResults] = useStoredDrawResult(prizeDistributor, draw.drawId)

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
      <PrizeVideoBackground
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
        claimTx={claimTx}
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
    className='absolute top-4 right-4 w-6 h-6 opacity-75 hover:opacity-100 transition-opacity cursor-pointer'
    onClick={props.hideDrawCard}
  />
)

interface DrawClaimButtonProps extends DrawPropsWithDetails {
  hasCheckedAnimationFinished: boolean
  claimState: ClaimState
  drawResults: DrawResults
  claimTx: Transaction
  setClaimState: (state: ClaimState) => void
  openModal: () => void
}

const DrawClaimButton = (props: DrawClaimButtonProps) => {
  const { claimState, setClaimState, openModal, drawResults, claimTx } = props
  const usersAddress = useUsersAddress()

  const { t } = useTranslation()

  let btnJsx

  if (!usersAddress) {
    return null
  } else if (claimTx?.inFlight) {
    // TODO: Double check that this ends after completing
    btnJsx = (
      <SquareButton disabled>
        <ThemedClipSpinner className='mr-2' />
        {t('claiming', 'Claiming')}
      </SquareButton>
    )
  } else if (claimTx?.completed && !claimTx?.error && !claimTx?.cancelled) {
    // TODO: Double check that this stays after claiming
    btnJsx = <SquareButton disabled>{t('viewReceipt', 'View receipt')}</SquareButton>
  } else if ([ClaimState.unchecked, ClaimState.checking].includes(claimState)) {
    const isChecking = claimState === ClaimState.checking
    btnJsx = (
      <SquareButton onClick={() => setClaimState(ClaimState.checking)} disabled={isChecking}>
        {isChecking ? (
          <>
            <ThemedClipSpinner sizeClassName='w-4 h-4' className='mr-2' />
            <span>{t('checkingForPrizes', 'Checking for prizes')}</span>
          </>
        ) : (
          <span>{t('checkForPrizes', 'Check for prizes')}</span>
        )}
      </SquareButton>
    )
  } else if (claimState === ClaimState.unclaimed && !drawResults.totalValue.isZero()) {
    btnJsx = (
      <SquareButton onClick={() => openModal()}>{t('viewPrizes', 'View prizes')}</SquareButton>
    )
  } else {
    btnJsx = <SquareButton disabled>{t('noPrizes', 'No prizes')}</SquareButton>
  }

  return <div className='relative z-20'>{btnJsx}</div>
}

const LoadingCard = () => <div className='w-full rounded-xl animate-pulse bg-card h-112' />
