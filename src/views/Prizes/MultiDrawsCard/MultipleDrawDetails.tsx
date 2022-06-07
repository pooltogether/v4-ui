import React from 'react'
import { useTranslation } from 'react-i18next'
import { Token } from '@pooltogether/hooks'

import { roundPrizeAmount } from '@utils/roundPrizeAmount'
import { DrawData } from '../../../interfaces/v4'
import { MultipleDrawsDate } from './MultipleDrawsDate'
import { ethers } from 'ethers'
import { MultiDrawsPrizeConfigsTrigger } from './MultiDrawsPrizeConfigsTrigger'
import classNames from 'classnames'
import { Draw } from '@pooltogether/v4-client-js'
import { TokenIcon } from '@pooltogether/react-components'

interface MultipleDrawDetailsProps {
  chainId: number
  drawDatas: { [drawId: number]: DrawData }
  token: Token
  prizeToken: Token
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
          <MultiDrawsPrizeConfigsTrigger
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
  chainId: number
  prizeToken: Token
  drawDatas: { [drawId: number]: DrawData }
  className?: string
  numberClassName?: string
  textClassName?: string
}) => {
  const { t } = useTranslation()
  const { drawDatas, chainId, prizeToken } = props

  if (!drawDatas || !prizeToken) {
    return null
  }

  const totalAmountUnformatted = Object.values(drawDatas)
    .filter((drawData) => Boolean(drawData.prizeConfig))
    .reduce((acc, drawData) => {
      return acc.add(drawData.prizeConfig.prize)
    }, ethers.constants.Zero)
  const { amountPretty } = roundPrizeAmount(totalAmountUnformatted, prizeToken.decimals)

  return (
    <div className={classNames(props.className, 'flex items-center space-x-2')}>
      <TokenIcon chainId={chainId} address={prizeToken.address} />
      <span className={props.numberClassName}>{amountPretty}</span>
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
