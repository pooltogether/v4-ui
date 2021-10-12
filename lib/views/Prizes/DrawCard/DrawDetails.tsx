import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { ModalWithStyles } from 'lib/components/Modal/ModalWithStyles'

export interface DrawDetailsProps {
  prizeDistribution: PrizeDistribution
  draw: Draw
  token: Token
}

export const DrawDetails = (props: DrawDetailsProps) => {
  return (
    <div className='w-full flex flex-col space-y-1 z-20'>
      <div className='flex flex-col xs:flex-row justify-between leading-none'>
        <span className='flex items-start'>
          <DrawId {...props} />
          <DrawDate {...props} />
        </span>
        <span className='flex xs:flex-col flex-col-reverse pt-1 xs:pt-0 space-y-2 items-start xs:items-end '>
          <span className='mt-1 xs:mt-0'>
            <ViewPrizeTiersTrigger {...props} />
          </span>
          <PrizeDistributorTotal {...props} />
        </span>
      </div>
    </div>
  )
}

export const PrizeDistributorTotal = (props: {
  prizeDistribution: PrizeDistribution
  token: Token
  className?: string
  numberClassName?: string
  textClassName?: string
}) => {
  const { t } = useTranslation()

  return (
    <div className={props.className}>
      <span className={props.numberClassName}>
        ${numberWithCommas(props.prizeDistribution.prize, { decimals: props.token.decimals })}
      </span>
      <span className={props.textClassName}>{t('inPrizes', 'in prizes')}</span>
    </div>
  )
}

PrizeDistributorTotal.defaultProps = {
  numberClassName: 'font-bold text-xl text-white',
  // 'text-flashy' huge CPU/GPU perf hit because it's being rendered on all carousel slides at once
  // numberClassName: 'font-bold text-xl text-flashy',
  textClassName: 'font-bold text-white text-xxs ml-2'
}

// export const DrawGrandPrize = (props: {
//   prizeDistribution: PrizeDistribution
//   token: Token
//   className?: string
//   numberClassName?: string
//   textClassName?: string
// }) => {
//   const { t } = useTranslation()

//   return (
//     <div className={props.className}>
//       <span className={props.numberClassName}>
//         $
//         {numberWithCommas(calculatePrizeForDistributionIndex(0, props.prizeDistribution), {
//           decimals: props.token.decimals
//         })}
//       </span>
//       <span className={props.textClassName}>{t('grandPrize', 'Grand prize')}</span>
//     </div>
//   )
// }

// DrawGrandPrize.defaultProps = {
//   numberClassName: 'font-bold text-xl sm:text-2xl w-full',
//   textClassName: 'font-bold text-accent-1 text-xxs ml-2'
// }

export const ViewPrizeTiersTrigger = (props: {
  prizeDistribution: PrizeDistribution
  token: Token
  className?: string
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const { t } = useTranslation()

  return (
    <>
      <button className={props.className} onClick={() => setIsOpen(true)}>
        {t('viewPrizeTiers', 'View prize tiers')}
      </button>
      <PrizeBreakdownModal {...props} isOpen={isOpen} closeModal={() => setIsOpen(false)} />
    </>
  )
}

ViewPrizeTiersTrigger.defaultProps = {
  className:
    'uppercase font-bold text-white text-xxs transition hover:text-green leading-none tracking-wide'
}

export const DrawDate = (props: { draw: Draw; className?: string }) => (
  <span className={props.className}>{getTimestampStringWithTime(props.draw.timestamp)}</span>
)

DrawDate.defaultProps = {
  className: 'uppercase font-bold text-white opacity-70 text-xxs leading-none'
}

export const DrawId = (props: { draw: Draw; className?: string }) => (
  <span className={props.className}>#{props.draw.drawId}</span>
)

DrawId.defaultProps = {
  className: 'uppercase font-bold text-white mr-2 opacity-50 text-xxs leading-none'
}

const PrizeBreakdownModal = (
  props: { prizeDistribution: PrizeDistribution; token: Token } & Omit<ModalProps, 'label'>
) => (
  <ModalWithStyles
    isOpen={props.isOpen}
    closeModal={props.closeModal}
    label='Prize breakdown modal'
  >
    <PrizeBreakdown
      className='mt-10 mx-auto'
      prizeDistribution={props.prizeDistribution}
      token={props.token}
    />
  </ModalWithStyles>
)
