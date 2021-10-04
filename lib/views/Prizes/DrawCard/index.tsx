import { Token, useTransaction } from '@pooltogether/hooks'
import {
  Card,
  Modal,
  ModalProps,
  SquareButton,
  ThemedClipSpinner
} from '@pooltogether/react-components'
import {
  DrawPrize,
  Draw,
  PrizeDistribution,
  DrawResults,
  calculatePrizeForDistributionIndex
} from '@pooltogether/v4-js-client'
import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import { numberWithCommas } from '@pooltogether/utilities'
import classNames from 'classnames'
import { PrizeBreakdown } from 'lib/components/PrizeBreakdown'
import { DECIMALS_FOR_DISTRIBUTIONS } from 'lib/constants/drawSettings'
import { useDrawSettings } from 'lib/hooks/Tsunami/DrawPrizes/useDrawSettings'
import { useUsersDrawResult } from 'lib/hooks/Tsunami/DrawPrizes/useUsersDrawResult'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { getTimestampStringWithTime } from 'lib/utils/getTimestampString'
import React, { useEffect, useState } from 'react'
import { PrizeAnimation } from 'lib/views/Prizes/DrawCard/PrizeAnimation'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { PrizeClaimModal } from './PrizeClaimModal'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useTranslation } from 'react-i18next'

interface DrawCardProps {
  drawPrize: DrawPrize
  draw: Draw
  hideDrawCard: () => void
  refetchUsersBalances: () => void
}

export interface DrawPropsWithDetails extends DrawCardProps {
  drawSettings: PrizeDistribution
  token: Token
  ticket: Token
}

export const DrawCard = (props: DrawCardProps) => {
  const { drawPrize, draw } = props
  const { data: prizePool } = useSelectedNetworkPrizePool()
  const {
    data: drawSettings,
    isFetched: isDrawSettingsFetched,
    error
  } = useDrawSettings(drawPrize, draw)
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)

  if (!isDrawSettingsFetched || !isPrizePoolTokensFetched) {
    return <LoadingCard />
  }

  if (!drawSettings || error) {
    return null
  }

  return (
    <Card>
      <div className='flex flex-col space-y-4'>
        <DrawDetails
          {...props}
          drawSettings={drawSettings}
          token={prizePoolTokens.token}
          ticket={prizePoolTokens.ticket}
        />
        <DrawClaimSection
          {...props}
          drawSettings={drawSettings}
          token={prizePoolTokens.token}
          ticket={prizePoolTokens.ticket}
        />
      </div>
    </Card>
  )
}

//////////////////// Draw details ////////////////////

const DrawDetails = (props: DrawPropsWithDetails) => {
  return (
    <div className='w-full flex flex-col space-y-2'>
      <div className='flex flex-row space-x-2'>
        <DrawId {...props} />
        <DrawDate {...props} />
      </div>
      <div className='flex flex-col sm:flex-row sm:space-x-2 justify-between'>
        <DrawPrizeTotal {...props} />
        <DrawGrandPrize {...props} />
      </div>
    </div>
  )
}

const DrawPrizeTotal = (props: DrawPropsWithDetails) => (
  <div className='text-center sm:text-left'>
    <span className='font-bold text-center text-5xl w-full text-flashy inline'>
      ${numberWithCommas(props.drawSettings.prize, { decimals: props.token.decimals })}
    </span>
    <span className='font-bold text-accent-1 leading-none text-xxs ml-2'>in prizes</span>
  </div>
)

const DrawGrandPrize = (props: DrawPropsWithDetails) => (
  <div className='mx-auto w-full max-w-sm sm:w-auto justify-between sm:justify-start flex flex-row sm:flex-col text-center sm:text-right px-2 sm:px-0'>
    <div>
      <span className='font-bold text-center text-xl sm:text-2xl text-inverse w-full'>
        $
        {numberWithCommas(calculatePrizeForDistributionIndex(0, props.drawSettings), {
          decimals: props.token.decimals
        })}
      </span>
      <span className='font-bold text-accent-1 leading-none text-xxs ml-2'>grand prize</span>
    </div>
    <ViewPrizesTrigger {...props} />
  </div>
)

const ViewPrizesTrigger = (props: DrawPropsWithDetails) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button
        className='text-xs ml-auto transition-colors text-accent-1 hover:text-inverse'
        onClick={() => setIsOpen(true)}
      >
        View prizes
      </button>
      <PrizeBreakdownModal {...props} isOpen={isOpen} closeModal={() => setIsOpen(false)} />
    </>
  )
}

const DrawDate = (props: DrawPropsWithDetails) => (
  <span className='uppercase font-bold text-accent-1 leading-none text-xxs'>
    {getTimestampStringWithTime(props.draw.timestamp)}
  </span>
)

const DrawId = (props: DrawPropsWithDetails) => (
  <span className='uppercase font-bold text-accent-2 opacity-70 leading-none text-xxs'>
    #{props.draw.drawId}
  </span>
)

const PrizeBreakdownModal = (props: DrawPropsWithDetails & Omit<ModalProps, 'label'>) => {
  const { isOpen, closeModal, drawSettings } = props
  const { data: prizePool } = useSelectedNetworkPrizePool()
  const { data: prizePoolTokens, isFetched } = usePrizePoolTokens(prizePool)
  return (
    <Modal isOpen={isOpen} closeModal={closeModal} label='Prize breakdown modal'>
      <PrizeBreakdown
        className='mt-10 mx-auto'
        drawSettings={drawSettings}
        token={prizePoolTokens?.token}
        isFetched={isFetched}
      />
    </Modal>
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
  const { drawPrize, draw } = props
  const [claimState, setClaimState] = useState<ClaimState>(ClaimState.unchecked)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const [txId, setTxId] = useState(0)
  const sendTx = useSendTransaction()
  const claimTx = useTransaction(txId)

  const { data: drawResults, isFetched: isDrawResultsFetched } = useUsersDrawResult(
    drawPrize,
    draw,
    claimState !== ClaimState.checking
  )

  useEffect(() => {
    if (claimState === ClaimState.checking && isDrawResultsFetched) {
      setClaimState(ClaimState.unclaimed)
    }
  }, [drawResults, isDrawResultsFetched])

  return (
    <>
      <PrizeAnimation
        totalPrizeValueUnformatted={drawResults?.totalValue}
        claimState={claimState}
      />
      <DrawClaimButton
        {...props}
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

interface DrawClaimButtonProps extends DrawPropsWithDetails {
  claimState: ClaimState
  drawResults: DrawResults
  setClaimState: (state: ClaimState) => void
  openModal: () => void
}

const DrawClaimButton = (props: DrawClaimButtonProps) => {
  const { claimState, setClaimState, openModal, drawResults } = props
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
