import { Token } from '@pooltogether/hooks'
import { Modal, ModalProps } from '@pooltogether/react-components'
import { numberWithCommas } from '@pooltogether/utilities'
import {
  calculatePrizeForDistributionIndex,
  Draw,
  PrizeDistribution
} from '@pooltogether/v4-js-client'
import { PrizeBreakdown } from 'lib/components/PrizeBreakdown'
import { getTimestampStringWithTime } from 'lib/utils/getTimestampString'
import React, { useState } from 'react'

export interface DrawDetailsProps {
  prizeDistribution: PrizeDistribution
  draw: Draw
  token: Token
}

export const DrawDetails = (props: DrawDetailsProps) => {
  return (
    <div className='w-full flex flex-col space-y-2'>
      <div className='flex flex-row space-x-2'>
        <DrawId {...props} />
        <DrawDate {...props} />
      </div>
      <div className='flex flex-col'>
        <DrawPrizeTotal {...props} />
        <div className='flex flex-row'>
          <DrawGrandPrize {...props} />
          <ViewPrizesTrigger {...props} />
        </div>
      </div>
    </div>
  )
}

export const DrawPrizeTotal = (props: {
  prizeDistribution: PrizeDistribution
  token: Token
  className?: string
  numberClassName?: string
  textClassName?: string
}) => (
  <div className={props.className}>
    <span className={props.numberClassName}>
      ${numberWithCommas(props.prizeDistribution.prize, { decimals: props.token.decimals })}
    </span>
    <span className={props.textClassName}>in prizes</span>
  </div>
)

DrawPrizeTotal.defaultProps = {
  numberClassName: 'font-bold text-5xl text-flashy',
  textClassName: 'font-bold text-accent-1 text-xxs ml-2'
}

export const DrawGrandPrize = (props: {
  prizeDistribution: PrizeDistribution
  token: Token
  className?: string
  numberClassName?: string
  textClassName?: string
}) => (
  <div className={props.className}>
    <span className={props.numberClassName}>
      $
      {numberWithCommas(calculatePrizeForDistributionIndex(0, props.prizeDistribution), {
        decimals: props.token.decimals
      })}
    </span>
    <span className={props.textClassName}>grand prize</span>
  </div>
)

DrawGrandPrize.defaultProps = {
  numberClassName: 'font-bold text-xl sm:text-2xl w-full',
  textClassName: 'font-bold text-accent-1 text-xxs ml-2'
}

export const ViewPrizesTrigger = (props: {
  prizeDistribution: PrizeDistribution
  token: Token
  className?: string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button className={props.className} onClick={() => setIsOpen(true)}>
        View prize tiers
      </button>
      <PrizeBreakdownModal {...props} isOpen={isOpen} closeModal={() => setIsOpen(false)} />
    </>
  )
}

ViewPrizesTrigger.defaultProps = {
  className: 'text-xs ml-auto transition-colors text-accent-1 hover:text-inverse'
}

export const DrawDate = (props: { draw: Draw; className?: string }) => (
  <span className={props.className}>{getTimestampStringWithTime(props.draw.timestamp)}</span>
)

DrawDate.defaultProps = {
  className: 'uppercase font-bold text-accent-1 leading-none text-xxs'
}

export const DrawId = (props: { draw: Draw; className?: string }) => (
  <span className={props.className}>#{props.draw.drawId}</span>
)

DrawId.defaultProps = {
  className: 'uppercase font-bold text-accent-2 opacity-70 leading-none text-xxs'
}

const PrizeBreakdownModal = (
  props: { prizeDistribution: PrizeDistribution; token: Token } & Omit<ModalProps, 'label'>
) => (
  <Modal isOpen={props.isOpen} closeModal={props.closeModal} label='Prize breakdown modal'>
    <PrizeBreakdown
      className='mt-10 mx-auto'
      prizeDistribution={props.prizeDistribution}
      token={props.token}
    />
  </Modal>
)
