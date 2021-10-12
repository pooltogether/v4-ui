import React, { useEffect, useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'
import { Token, Transaction, useTransaction } from '@pooltogether/hooks'
import {
  formatBlockExplorerTxUrl,
  Card,
  SquareLink,
  SquareButton,
  SquareButtonTheme,
  SquareButtonSize,
  ThemedClipSpinner,
  Tooltip
} from '@pooltogether/react-components'
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
import { DrawLock } from 'lib/hooks/Tsunami/PrizeDistributor/useDrawLocks'
import { useTimeUntil } from 'lib/hooks/useTimeUntil'
import { CountdownString } from 'lib/components/CountdownString'

interface DrawCardProps {
  prizeDistribution: PrizeDistribution
  prizeDistributor: PrizeDistributor
  draw: Draw
  drawLock: DrawLock
  hideDrawCard: () => void
  refetchUsersBalances: () => void
}

export interface DrawPropsWithDetails extends DrawCardProps {
  token: Token
  ticket: Token
}

export const DrawCard = (props: DrawCardProps) => {
  const { prizeDistribution, prizeDistributor } = props
  const { data: prizePool } = useSelectedNetworkPrizePool()
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)

  if (!isPrizePoolTokensFetched) {
    return <LoadingCard />
  }

  return (
    <Card className='draw-card relative'>
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
        drawResults={drawResults}
        setCheckedAnimationFinished={() => setHasCheckedAnimationFinished(true)}
        claimState={claimState}
      />
      <div className='absolute xs:relative mx-auto xs:mx-0 left-0 xs:left-auto right-0 xs:right-auto bottom-4 xs:bottom-auto xs:-top-6 text-center z-20'>
        <DrawClaimButton
          {...props}
          hasCheckedAnimationFinished={hasCheckedAnimationFinished}
          drawResults={drawResults}
          claimState={claimState}
          setClaimState={setClaimState}
          openModal={() => setIsModalOpen(true)}
          claimTx={claimTx}
        />
      </div>
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
  const { claimState, setClaimState, openModal, drawResults, claimTx, drawLock, draw } = props
  const usersAddress = useUsersAddress()

  const countdown = useTimeUntil(drawLock?.endTimeSeconds.toNumber())

  const { t } = useTranslation()

  let btnJsx, url

  if (claimTx?.hash) {
    url = formatBlockExplorerTxUrl(claimTx.hash, claimTx.ethersTx.chainId)
  }

  if (!usersAddress) {
    return null
  } else if (drawLock && countdown.secondsLeft) {
    const { weeks, days, hours, minutes } = countdown

    const thereIsWeeks = weeks > 0
    const thereIsDays = thereIsWeeks || days > 0
    const thereIsHours = thereIsDays || hours > 0
    const thereIsMinutes = thereIsHours || minutes > 0

    btnJsx = (
      <div className='flex flex-col mx-auto xs:mx-0 text-center'>
        <SquareButton disabled className='flex w-max mx-auto xs:mx-0' size={SquareButtonSize.sm}>
          <FeatherIcon icon='lock' className='w-4 h-4 my-auto mr-2' />
          {t('checkForPrizes', 'Check for prizes')}
        </SquareButton>
        <div className='text-left uppercase font-semibold text-white opacity-90 text-xxs leading-none mt-2'>
          Draw #{draw.drawId} unlocks in{' '}
          <CountdownString
            {...countdown}
            hideHours={thereIsWeeks}
            hideMinutes={thereIsDays}
            hideSeconds={thereIsMinutes}
          />
        </div>
      </div>
    )
  } else if (claimTx?.inFlight) {
    btnJsx = (
      <SquareLink
        Link={Link}
        target='_blank'
        href={url}
        theme={SquareButtonTheme.teal}
        size={SquareButtonSize.md}
        className='text-center mx-auto xs:mx-0'
      >
        <ThemedClipSpinner className='mr-2' size={12} />
        {t('claiming', 'Claiming')}
      </SquareLink>
    )
  } else if (claimTx?.completed && !claimTx?.error && !claimTx?.cancelled) {
    btnJsx = (
      <SquareLink
        Link={Link}
        target='_blank'
        href={url}
        theme={SquareButtonTheme.tealOutline}
        size={SquareButtonSize.md}
        className='text-center mx-auto xs:mx-0'
      >
        {t('viewReceipt', 'View receipt')}
      </SquareLink>
    )
  } else if ([ClaimState.unchecked, ClaimState.checking].includes(claimState)) {
    const isChecking = claimState === ClaimState.checking
    btnJsx = (
      <SquareButton
        size={SquareButtonSize.md}
        onClick={() => setClaimState(ClaimState.checking)}
        disabled={isChecking}
        className='text-center mx-auto xs:mx-0'
      >
        {isChecking ? (
          <>
            <ThemedClipSpinner size={12} className='mr-2' />
            {t('checkingForPrizes', 'Checking for prizes')}
          </>
        ) : (
          t('checkForPrizes', 'Check for prizes')
        )}
      </SquareButton>
    )
  } else if (claimState === ClaimState.unclaimed && !drawResults.totalValue.isZero()) {
    btnJsx = (
      <SquareButton
        theme={SquareButtonTheme.rainbow}
        size={SquareButtonSize.md}
        onClick={() => openModal()}
        className='text-center mx-auto xs:mx-0'
      >
        {t('claimPrizes', 'Claim prizes')}
      </SquareButton>
    )
  } else {
    // TODO: Show 'Prizes claimed' or 'No prizes to claim'
    btnJsx = (
      <SquareButton size={SquareButtonSize.md} disabled className='text-center mx-auto xs:mx-0'>
        {t('noPrizesToClaim', 'No prizes to claim')}
      </SquareButton>
    )
  }

  return <div className='flex items-start relative'>{btnJsx}</div>
}

const LoadingCard = () => (
  <div className='w-full rounded-xl animate-pulse bg-card mb-4 h-48 xs:h-112' />
)
