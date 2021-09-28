import { Token } from '@pooltogether/hooks'
import { Card, Modal, ModalProps, SquareButton } from '.yalc/@pooltogether/react-components/dist'
import { DrawPrize, Draw, DrawSettings } from '.yalc/@pooltogether/v4-js-client/dist'
import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import { numberWithCommas } from '@pooltogether/utilities'
import classNames from 'classnames'
import { PrizeBreakdown } from 'lib/components/PrizeBreakdown'
import { DECIMALS_FOR_DISTRIBUTIONS, getPositionalPrize } from 'lib/constants/drawSettings'
import { useDrawSettings } from 'lib/hooks/Tsunami/DrawPrizes/useDrawSettings'
import { useUsersClaimablePrize } from 'lib/hooks/Tsunami/DrawPrizes/useUsersClaimablePrize'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { getTimestampStringWithTime } from 'lib/utils/getTimestampString'
import React, { useEffect, useState } from 'react'
import { LoadingCard } from '.'

interface DrawCardProps {
  drawPrize: DrawPrize
  draw: Draw
}

interface DrawPropsWithDetails extends DrawCardProps {
  drawSettings: DrawSettings
  token: Token
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

  useEffect(() => {
    if (isDrawSettingsFetched && (!drawSettings || error)) {
      // TODO: Getting an error fetching draw settings :(
      console.log('ERROR', draw, error)
    }
  }, [drawSettings, error, isDrawSettingsFetched])

  if (!isDrawSettingsFetched || !isPrizePoolTokensFetched) {
    return <LoadingCard />
  }

  if (!drawSettings || error) {
    return null
  }

  return (
    <Card>
      <div className='flex flex-col space-y-4'>
        <DrawDetails {...props} drawSettings={drawSettings} token={prizePoolTokens.token} />
        <DrawClaimSection {...props} drawSettings={drawSettings} token={prizePoolTokens.token} />
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
        ${getPositionalPrize(0, props.drawSettings, props.token)}
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
        className='mt-10'
        drawSettings={drawSettings}
        token={prizePoolTokens?.token}
        isFetched={isFetched}
      />
    </Modal>
  )
}

//////////////////// Draw claim ////////////////////

enum ClaimSectionState {
  loading,
  unchecked,
  unclaimed,
  claimed
}

interface DrawClaimSectionProps extends DrawPropsWithDetails {
  setClaimSectionState: (state: ClaimSectionState) => void
}

const DrawClaimSection = (props: DrawPropsWithDetails) => {
  const [claimSectionState, setClaimSectionState] = useState<ClaimSectionState>(
    ClaimSectionState.unchecked
  )

  if (claimSectionState === ClaimSectionState.loading) {
    return <LoadingDrawClaimSection {...props} />
  }

  if (claimSectionState === ClaimSectionState.unchecked) {
    return <UncheckedDrawSection {...props} setClaimSectionState={setClaimSectionState} />
  }

  if (claimSectionState === ClaimSectionState.unclaimed) {
    return <UnclaimedDrawSection {...props} setClaimSectionState={setClaimSectionState} />
  }

  if (claimSectionState === ClaimSectionState.claimed) {
    return <ClaimedDrawSection {...props} setClaimSectionState={setClaimSectionState} />
  }

  return null
}

const LoadingDrawClaimSection = (props: DrawPropsWithDetails) => {
  return (
    <div className='w-full flex flex-col space-y-8'>
      <div className='h-60 w-60 bg-pt-teal-dark animate-pulse rounded-xl mx-auto' />
      <SquareButton>Check for prizes</SquareButton>
    </div>
  )
}

enum UncheckedState {
  unchecked,
  checking
}

const UncheckedDrawSection = (props: DrawClaimSectionProps) => {
  const { drawPrize, draw, setClaimSectionState } = props
  const [uncheckedState, setUncheckedState] = useState<UncheckedState>(UncheckedState.unchecked)
  const disabled = uncheckedState === UncheckedState.unchecked
  const { isFetched } = useUsersClaimablePrize(drawPrize, draw, disabled)

  // TODO: Make this an interval for a video loop.
  // Make this view appear for a minimum of 1 loop.
  // Check if claimed here? Probably do it above to skip this step.
  useEffect(() => {
    if (isFetched && uncheckedState) {
      setClaimSectionState(ClaimSectionState.unclaimed)
    }
  }, [isFetched, uncheckedState])

  return (
    <div className='w-full flex flex-col space-y-8'>
      <div
        className={classNames('h-60 w-60 rounded-xl mx-auto', {
          'bg-pt-teal-dark': uncheckedState === UncheckedState.unchecked,
          'bg-pt-teal-light animate-pulse': uncheckedState === UncheckedState.checking
        })}
      />
      <SquareButton onClick={() => setUncheckedState(UncheckedState.checking)}>
        Check for prizes
      </SquareButton>
    </div>
  )
}

const UnclaimedDrawSection = (props: DrawClaimSectionProps) => {
  const { drawPrize, draw, setClaimSectionState, token } = props
  const { data: drawResults, isFetched } = useUsersClaimablePrize(drawPrize, draw)

  console.log(drawResults, isFetched)
  const totalWinnings = numberWithCommas(drawResults.totalValue, { decimals: token.decimals })

  return (
    <Card>
      <span>{totalWinnings}</span>
      <SquareButton onClick={() => drawPrize.claimPrizesByDrawResults(drawResults)}>
        Claim
      </SquareButton>
    </Card>
  )
}

const ClaimedDrawSection = (props: DrawClaimSectionProps) => {
  return <Card>Claimed</Card>
}
