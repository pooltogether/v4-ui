import { Token } from '@pooltogether/hooks'
import {
  calculateNumberOfPrizesForIndex,
  calculatePrizeForDistributionIndex,
  PrizeDistribution
} from '@pooltogether/v4-js-client'
import { BigNumber } from '@ethersproject/bignumber'
import classnames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { numberWithCommas } from '@pooltogether/utilities'

import { PrizeWLaurels } from './Images/PrizeWithLaurels'

interface PrizeBreakdownProps {
  prizeDistribution: PrizeDistribution
  token: Token
  className?: string
  isFetched?: boolean
}

// TODO: Convert values into nice ones
export const PrizeBreakdown = (props: PrizeBreakdownProps) => {
  const { prizeDistribution, className, token, isFetched } = props
  const { tiers, prize, numberOfPicks } = prizeDistribution
  const { t } = useTranslation()

  return (
    <div className={classnames('flex flex-col max-w-md text-center', className)}>
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
        <div className='flex flex-col space-y-2'>
          {!isFetched ? (
            Array.from(Array(3)).map((_, i) => <LoadingPrizeRow key={`loading-row-${i}`} />)
          ) : (
            <>
              {tiers.map((distribution, i) => (
                <PrizeTableRow
                  key={`distribution_row_${i}`}
                  index={i}
                  prizeDistribution={prizeDistribution}
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

PrizeBreakdown.defaultProps = {
  isFetched: true
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
  prizeDistribution: PrizeDistribution
  index: number
  totalPrize: BigNumber
  numberOfPicks: BigNumber
  token: Token
}

// TODO: Calculate number of winners w draw settings
// Calculate prize w draw settings
// Calculate odds
const PrizeTableRow = (props: PrizeTableRowProps) => {
  const { index, prizeDistribution, totalPrize, token } = props

  const prizeForDistributionUnformatted = calculatePrizeForDistributionIndex(
    index,
    prizeDistribution
  )
  const numberOfWinners = calculateNumberOfPrizesForIndex(prizeDistribution.bitRangeSize, index)

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
