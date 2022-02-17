import React from 'react'
import { useTranslation } from 'react-i18next'
import { Token } from '@pooltogether/hooks'

import { roundPrizeAmount } from '@utils/roundPrizeAmount'
import { DrawData } from '../../../interfaces/v4'
import { MultipleDrawsDate } from './MultipleDrawsDate'
import { ethers } from 'ethers'
import { MultiDrawsPrizeTiersTrigger } from './MultiDrawsPrizeTiersTrigger'
import classNames from 'classnames'
import { Draw } from '@pooltogether/v4-client-js'

interface MultipleDrawDetailsProps {
  drawDatas: { [drawId: number]: DrawData }
  token: Token
  ticket: Token
  className?: string
}

export const MultipleDrawDetails = (props: MultipleDrawDetailsProps) => {
  const { className, drawDatas, ...remainingProps } = props
  return (
    <div className={classNames('w-full flex flex-col', className)}>
      <div className='flex flex-col xs:flex-row justify-between leading-none'>
        <span className='flex items-start'>
          <MultipleDrawIds {...remainingProps} partialDrawDatas={drawDatas} />
          <MultipleDrawsDate {...remainingProps} partialDrawDatas={drawDatas} />
        </span>
        <span className='flex xs:flex-col flex-col-reverse items-start xs:items-end '>
          <MultiDrawsPrizeTiersTrigger
            className='mt-2 xs:mt-0 text-white'
            {...remainingProps}
            drawDatas={drawDatas}
          />
          <TotalPrizes className='mt-2' {...remainingProps} drawDatas={drawDatas} />
        </span>
      </div>
    </div>
  )
}

export const TotalPrizes = (props: {
  token: Token
  drawDatas: { [drawId: number]: DrawData }
  className?: string
  numberClassName?: string
  textClassName?: string
}) => {
  const { t } = useTranslation()
  const { drawDatas, token } = props

  if (!drawDatas) {
    return null
  }

  const totalAmountUnformatted = Object.values(drawDatas).reduce((acc, drawData) => {
    return acc.add(drawData.prizeDistribution.prize)
  }, ethers.constants.Zero)
  const { amountPretty } = roundPrizeAmount(totalAmountUnformatted, token.decimals)

  return (
    <div className={props.className}>
      <span className={props.numberClassName}>${amountPretty}</span>
      <span className={props.textClassName}>{t('inPrizes', 'in prizes')}</span>
    </div>
  )
}

TotalPrizes.defaultProps = {
  numberClassName: 'font-bold text-white text-xs xs:text-sm',
  textClassName: 'font-bold text-white text-xxs xs:text-xs ml-1 opacity-60'
}

export const MultipleDrawIds = (props: {
  partialDrawDatas: { [drawId: number]: { draw: Draw } }
  className?: string
}) => {
  const { t } = useTranslation()
  const { partialDrawDatas, className } = props
  const drawIds = Object.keys(partialDrawDatas)
  if (drawIds.length === 0) {
    return null
  } else if (drawIds.length === 1) {
    return <span className={className}>#{drawIds[0]}</span>
  }
  return <span className={className}>{t('multipleDraws', 'Multiple draws')}</span>
}

MultipleDrawIds.defaultProps = {
  className: 'uppercase font-bold text-white mr-2 opacity-50 text-xs leading-none'
}
