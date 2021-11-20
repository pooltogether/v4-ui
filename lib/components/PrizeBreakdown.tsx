import React from 'react'
import classnames from 'classnames'
import { Token } from '@pooltogether/hooks'
import { SquareButton, SquareButtonSize, SquareButtonTheme } from '@pooltogether/react-components'
import {
  calculateNumberOfPrizesForIndex,
  calculatePrizeForDistributionIndex,
  PrizeDistribution
} from '@pooltogether/v4-js-client'
import { BigNumber } from '@ethersproject/bignumber'
import { useTranslation } from 'react-i18next'

import { roundPrizeAmount } from 'lib/utils/roundPrizeAmount'

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
      <div className='flex justify-between space-x-2 sm:space-x-4'>
        <PrizeTableHeader>{t('amount')}</PrizeTableHeader>
        <PrizeTableHeader>{t('projectedPrizes', 'Prizes (Projected)')}</PrizeTableHeader>
        {/* <PrizeTableHeader>{t('oddsPerPick', 'Odds per pick')}</PrizeTableHeader> */}
      </div>
      <div className='flex flex-col space-y-2'>
        {!isFetched ? (
          Array.from(Array(3)).map((_, i) => <LoadingPrizeRow key={`loading-row-${i}`} />)
        ) : (
          <>
            {tiers.map((distribution, i) => (
              <PrizeBreakdownTableRow
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
      'font-inter text-xxs uppercase font-semibold text-inverse mt-8 mb-2 opacity-60 w-full',
      props.className
    )}
  />
)

interface PrizeBreakdownTableRowProps {
  prizeDistribution: PrizeDistribution
  index: number
  totalPrize: BigNumber
  numberOfPicks: BigNumber
  token: Token
}

// TODO: Calculate number of winners w draw settings
// Calculate prize w draw settings
// Calculate odds
const PrizeBreakdownTableRow = (props: PrizeBreakdownTableRowProps) => {
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

  let amountPretty
  if (index === 0) {
    amountPretty = roundPrizeAmount(prizeForDistributionUnformatted, token.decimals).amountPretty
  } else if (index === 3) {
    amountPretty = 100
  } else {
    amountPretty = 10
  }

  // const { amountPretty } = roundPrizeAmount(prizeForDistributionUnformatted, token.decimals)

  return (
    <div className='flex flex-row justify-between space-x-2 sm:space-x-4'>
      <PrizeTableCell index={index}>${amountPretty}</PrizeTableCell>
      <PrizeTableCell index={index}>{numberOfWinners}</PrizeTableCell>
      {/* <PrizeTableCell index={index}>--</PrizeTableCell> */}
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
      'opacity-70 text-inverse font-semibold': props.index !== 0
    })}
  />
)
