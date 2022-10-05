import { usePrizePoolExpectedPrizes } from '@hooks/v4/PrizePool/usePrizePoolExpectedPrizes'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { Amount, Token } from '@pooltogether/hooks'
import classnames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const ExpectedPrizeBreakdown: React.FC<{
  className?: string
}> = (props) => {
  const { className } = props
  const { t } = useTranslation()
  const prizePool = useSelectedPrizePool()
  const { data: prizeData, isFetched: isPrizesFetched } = usePrizePoolExpectedPrizes(prizePool)
  const { data: tokenData, isFetched: isTokensFetched } = usePrizePoolTokens(prizePool)

  const isFetched = isPrizesFetched && isTokensFetched

  return (
    <div className={classnames('flex flex-col max-w-md text-center', className)}>
      <span className='mb-2 font-bold'>Prize Breakdown for next draw</span>
      <div className='grid grid-cols-2 mb-2'>
        <PrizeTableHeader>Prize Value</PrizeTableHeader>
        <PrizeTableHeader>Expected Prizes</PrizeTableHeader>
      </div>
      <ul className='flex flex-col space-y-3'>
        {!isFetched ? (
          Array.from(Array(3)).map((_, i) => <LoadingPrizeRow key={`loading-row-${i}`} />)
        ) : (
          <>
            {prizeData.prizeTier?.tiers.map((_, i) => (
              <PrizeBreakdownTableRow
                key={`distribution_row_${i}`}
                index={i}
                prizeValue={prizeData.valueOfPrizesByTier[i]}
                expectedNumberOfPrizes={prizeData.expectedNumberOfPrizesByTier[i]}
                ticket={tokenData.ticket}
              />
            ))}
          </>
        )}
      </ul>
    </div>
  )
}

const LoadingPrizeRow = () => <li className='h-8 rounded-lg w-full bg-body animate-pulse' />

const PrizeTableHeader = (
  props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
) => (
  <div
    {...props}
    className={classnames(
      'text-xxs text-pt-purple-darkest text-opacity-70 dark:text-pt-purple-lightest dark:text-opacity-70',
      props.className
    )}
  />
)

// Calculate prize w draw settings
const PrizeBreakdownTableRow: React.FC<{
  index: number
  prizeValue: Amount
  expectedNumberOfPrizes: number
  ticket: Token
}> = (props) => {
  const { index, prizeValue, expectedNumberOfPrizes } = props

  if (prizeValue.amountUnformatted.isZero()) return null

  return (
    <li className='grid grid-cols-2'>
      <PrizeTableCell index={index}>${prizeValue.amountPretty}</PrizeTableCell>
      <PrizeTableCell index={index}>{Math.round(expectedNumberOfPrizes)}</PrizeTableCell>
    </li>
  )
}

interface PrizeTableCellProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  index: number
}

const PrizeTableCell = (props: PrizeTableCellProps) => (
  <div
    {...props}
    className={classnames(props.className, 'text-sm xs:text-lg capitalize leading-none w-full', {
      'text-flashy font-bold': props.index === 0,
      'text-opacity-70': props.index !== 0
    })}
  />
)
