import { Token } from '.yalc/@pooltogether/hooks/dist'
import { Card, Modal, ModalProps, SquareButton } from '.yalc/@pooltogether/react-components/dist'
import { ClaimableDraw, Draw, DrawSettings } from '.yalc/@pooltogether/v4-js-client/dist'
import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import { numberWithCommas } from '@pooltogether/utilities'
import { PrizeBreakdown } from 'lib/components/PrizeBreakdown'
import { DECIMALS_FOR_DISTRIBUTIONS, getPositionalPrize } from 'lib/constants/drawSettings'
import { useDrawSettings } from 'lib/hooks/Tsunami/ClaimableDraws/useDrawSettings'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { getTimestampString } from 'lib/utils/getTimestampString'
import React, { useState } from 'react'
import { LoadingCard } from '.'

interface DrawCardProps {
  claimableDraw: ClaimableDraw
  draw: Draw
}

interface FullDrawProps extends DrawCardProps {
  drawSettings: DrawSettings
  token: Token
}

export const DrawCard = (props: DrawCardProps) => {
  const { claimableDraw, draw } = props
  const { data: prizePool } = useSelectedNetworkPrizePool()
  const { data: drawSettings, isFetched: isDrawSettingsFetched } = useDrawSettings(
    claimableDraw,
    draw
  )
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)

  if (!isDrawSettingsFetched || !isPrizePoolTokensFetched) {
    return <LoadingCard />
  }

  if (!drawSettings) {
    // TODO: Getting an error fetching draw settings :(
    console.log('ERROR', draw)
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

const DrawDetails = (props: FullDrawProps) => {
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

const DrawPrizeTotal = (props: FullDrawProps) => (
  <div className='text-center sm:text-left'>
    <span className='font-bold text-center text-5xl w-full text-flashy inline'>
      ${numberWithCommas(props.drawSettings.prize, { decimals: props.token.decimals })}
    </span>
    <span className='font-bold text-accent-1 leading-none text-xxs ml-2'>in prizes</span>
  </div>
)

const DrawGrandPrize = (props: FullDrawProps) => (
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

const ViewPrizesTrigger = (props: FullDrawProps) => {
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

const DrawDate = (props: FullDrawProps) => (
  <span className='uppercase font-bold text-accent-1 leading-none text-xxs'>
    {getTimestampString(props.draw.timestamp)}
  </span>
)

const DrawId = (props: FullDrawProps) => (
  <span className='uppercase font-bold text-accent-2 opacity-70 leading-none text-xxs'>
    #{props.draw.drawId}
  </span>
)

const PrizeBreakdownModal = (props: FullDrawProps & Omit<ModalProps, 'label'>) => {
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

const DrawClaimSection = (props: FullDrawProps) => {
  if (false) {
    return <LoadingDrawClaimSection {...props} />
  }

  if (false) {
    return <UnclaimedDrawSection {...props} />
  }

  if (false) {
    return <ClaimedDrawSection {...props} />
  }

  return <UncheckedDrawSection {...props} />
}

const UncheckedDrawSection = (props: FullDrawProps) => {
  return (
    <div className='w-full flex flex-col space-y-8'>
      <div className='h-60 w-60 bg-pt-teal-dark rounded-xl mx-auto' />
      <SquareButton>Check for prizes</SquareButton>
    </div>
  )
}

const LoadingDrawClaimSection = (props: FullDrawProps) => {
  return (
    <div className='w-full flex flex-col space-y-8'>
      <div className='h-60 w-60 bg-pt-teal-dark animate-pulse rounded-xl mx-auto' />
      <SquareButton>Check for prizes</SquareButton>
    </div>
  )
}

const UnclaimedDrawSection = (props: FullDrawProps) => {
  return <Card>Unclaimed</Card>
}

const ClaimedDrawSection = (props: FullDrawProps) => {
  return <Card>Claimed</Card>
}
