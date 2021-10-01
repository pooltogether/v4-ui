import { Token } from '@pooltogether/hooks'
import {
  calculateNumberOfPrizesForIndex,
  calculatePrizeForDistributionIndex,
  Draw,
  PrizeDistributions
} from '@pooltogether/v4-js-client'
import { BigNumber } from '@ethersproject/bignumber'
import classnames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { PrizeWLaurels } from './Images/PrizeWithLaurels'
import { ethers } from 'ethers'
import { numberWithCommas } from '@pooltogether/utilities'

interface PrizeBreakdownProps {
  drawSettings: PrizeDistributions
  token: Token
  className?: string
  isFetched?: boolean
}

// TODO: Convert values into nice ones
export const PrizeBreakdown = (props: PrizeBreakdownProps) => {
  const { drawSettings, className, token, isFetched } = props
  const { distributions, prize, numberOfPicks } = drawSettings
  const { t } = useTranslation()

  return (
    <div className={classnames('flex flex-col', className)}>
      <PrizeWLaurels className='mx-auto' />
      <div className='font-inter font-semibold text-sm capitalize text-accent-1 my-3 text-center'>
        {t('prizeBreakdown')}
      </div>

      <hr className='border-accent-3' style={{ width: '100%' }} />
      <div className={'flex flex-col'}>
        <div className='flex justify-between space-x-2 sm:space-x-4'>
          <PrizeTableHeader>{t('amount')}</PrizeTableHeader>
          <PrizeTableHeader>{t('winners')}</PrizeTableHeader>
          <PrizeTableHeader>{t('oddsPerPick', 'Odds per pick')}</PrizeTableHeader>
        </div>
        <div className='flex flex-col'>
          {!isFetched ? (
            Array.from(Array(10)).map((_, i) => <LoadingPrizeRow key={`loading-row`} />)
          ) : (
            <>
              {distributions.map((distribution, i) => (
                <PrizeTableRow
                  key={`distribution_row_${i}`}
                  index={i}
                  drawSettings={drawSettings}
                  numberOfPicks={numberOfPicks}
                  totalPrize={prize}
                  token={token}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const LoadingPrizeRow = () => <div className='h-8 rounded-lg w-full bg-body animate-pulse' />

const PrizeTableHeader = (
  props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
) => (
  <div
    {...props}
    className={classnames(
      'font-inter text-xxs capitalize text-accent-1 mt-8 mb-2 opacity-60 w-full',
      props.className
    )}
  />
)

interface PrizeTableRowProps {
  drawSettings: PrizeDistributions
  index: number
  totalPrize: BigNumber
  numberOfPicks: BigNumber
  token: Token
}

// TODO: Calculate number of winners w draw settings
// Calculate prize w draw settings
// Calculate odds
const PrizeTableRow = (props: PrizeTableRowProps) => {
  const { index, drawSettings, totalPrize, token } = props

  const prizeForDistributionUnformatted = calculatePrizeForDistributionIndex(index, drawSettings, {
    drawId: 0,
    timestamp: 0,
    winningRandomNumber: ethers.constants.Zero
  })
  const numberOfWinners = calculateNumberOfPrizesForIndex(drawSettings.bitRangeSize, index)

  // Hide rows that don't have a prize
  if (prizeForDistributionUnformatted.isZero()) {
    return null
  }

  return (
    <div className='flex flex-row justify-between space-x-2 sm:space-x-4'>
      <PrizeTableCell index={index}>
        ${numberWithCommas(prizeForDistributionUnformatted, { decimals: token.decimals })}
      </PrizeTableCell>
      <PrizeTableCell index={index}>{numberOfWinners}</PrizeTableCell>
      <PrizeTableCell index={index}>--</PrizeTableCell>
    </div>
  )
}

interface PrizeTableCellProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  index: number
}

const PrizeTableCell = (props: PrizeTableCellProps) => (
  <div
    {...props}
    className={classnames(props.className, 'font-inter text-sm xs:text-lg capitalize my-1 w-full', {
      'text-flashy font-bold': props.index === 0,
      'opacity-60 text-accent-1 font-semibold': props.index !== 0
    })}
  />
)
