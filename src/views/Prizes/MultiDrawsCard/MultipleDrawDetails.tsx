import { CurrencyValue } from '@components/CurrencyValue'
import { Token } from '@pooltogether/hooks'
import { Draw } from '@pooltogether/v4-client-js'
import { roundPrizeAmount } from '@utils/roundPrizeAmount'
import classNames from 'classnames'
import { ethers } from 'ethers'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { DrawData } from '../../../interfaces/v4'
import { MultiDrawsPrizeTiersTrigger } from './MultiDrawsPrizeTiersTrigger'
import { MultipleDrawsDate } from './MultipleDrawsDate'

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
        <span className='flex flex-col'>
          <MultipleDrawIds
            {...remainingProps}
            partialDrawDatas={drawDatas}
            fontClassName='text-white text-opacity-70'
          />
          <MultipleDrawsDate
            {...remainingProps}
            partialDrawDatas={drawDatas}
            fontClassName='text-white text-opacity-90'
          />
        </span>
        <span className='flex xs:flex-col flex-col-reverse items-start xs:items-end '>
          <MultiDrawsPrizeTiersTrigger
            className='mt-4 xs:mt-0 text-white'
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

  const totalAmountUnformatted = Object.values(drawDatas)
    .filter((drawData) => Boolean(drawData.prizeDistribution))
    .reduce((acc, drawData) => {
      return acc.add(drawData.prizeDistribution.prize)
    }, ethers.constants.Zero)
  const { amount } = roundPrizeAmount(totalAmountUnformatted, token.decimals)

  return (
    <div className={props.className}>
      <span className={props.numberClassName}>
        <CurrencyValue baseValue={amount} />
      </span>
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
  fontClassName?: string
}) => {
  const { t } = useTranslation()
  const { partialDrawDatas, className, fontClassName } = props
  const drawIds = Object.keys(partialDrawDatas)
  if (drawIds.length === 0) {
    return null
  } else if (drawIds.length === 1) {
    return <span className={classNames(className, fontClassName)}>#{drawIds[0]}</span>
  }
  return (
    <span className={classNames(className, fontClassName)}>
      {t('multipleDraws', 'Multiple draws')}
    </span>
  )
}

MultipleDrawIds.defaultProps = {
  className: 'uppercase mr-2 font-bold text-xs leading-none',
  fontClassName: 'text-pt-purple-darkest text-opacity-70 dark:text-white dark:text-opacity-70'
}
