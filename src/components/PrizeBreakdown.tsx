import { Amount } from '@pooltogether/hooks'
import { formatCurrencyNumberForDisplay, formatNumberForDisplay } from '@pooltogether/utilities'
import { PrizeTier } from '@pooltogether/v4-client-js'
import { getPrizeTierNumberOfPrizes } from '@utils/getPrizeTierNumberOfPrizes'
import { getPrizeTierValues } from '@utils/getPrizeTierValues'
import classNames from 'classnames'
import classnames from 'classnames'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { LoadingPrizeRow, PrizeTableHeader } from './ModalViews/DepositView/ExpectedPrizeBreakdown'

interface PrizeBreakdownProps {
  prizeTier: PrizeTier
  decimals: string
  className?: string
  isFetched?: boolean
}

// TODO: Convert values into nice ones
export const PrizeBreakdown = (props: PrizeBreakdownProps) => {
  const { prizeTier, className, decimals, isFetched } = props
  const { t } = useTranslation()

  const { numberOfPrizesByTier, totalNumberOfPrizes, valueOfPrizesByTier } = useMemo(() => {
    const numberOfPrizesByTier = getPrizeTierNumberOfPrizes(prizeTier)
    const totalNumberOfPrizes = numberOfPrizesByTier.reduce((a, b) => a + b, 0)
    const valueOfPrizesByTier = getPrizeTierValues(prizeTier, decimals)
    return {
      numberOfPrizesByTier,
      totalNumberOfPrizes,
      valueOfPrizesByTier
    }
  }, [prizeTier, decimals])

  return (
    <div className={classnames('flex flex-col max-w-md text-center', className)}>
      <div className={classNames('grid grid-cols-2')}>
        <PrizeTableHeader>{t('prizeValue')}</PrizeTableHeader>
        <PrizeTableHeader>{t('percentOfPrizes')}</PrizeTableHeader>
      </div>

      {!isFetched ? (
        <>
          <LoadingPrizeRow />
          <LoadingPrizeRow />
          <LoadingPrizeRow />
        </>
      ) : (
        <ul className={classNames('grid gap-3 grid-cols-2')}>
          {prizeTier?.tiers.map((_, i) => (
            <PrizeBreakdownTableRow
              key={`distribution_row_${i}`}
              index={i}
              valueOfPrize={valueOfPrizesByTier[i]}
              numberOfPrizes={numberOfPrizesByTier[i]}
              totalNumberOfPrizes={totalNumberOfPrizes}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

PrizeBreakdown.defaultProps = {
  isFetched: true
}

// Calculate prize w draw settings
const PrizeBreakdownTableRow = (props: {
  index: number
  valueOfPrize: Amount
  totalNumberOfPrizes: number
  numberOfPrizes: number
}) => {
  const { index, numberOfPrizes, valueOfPrize, totalNumberOfPrizes } = props

  if (numberOfPrizes === 0) return null

  return (
    <>
      <PrizeTableCell index={index}>
        {formatCurrencyNumberForDisplay(valueOfPrize.amount, 'usd', { maximumFractionDigits: 0 })}
      </PrizeTableCell>
      <PrizeTableCell index={index}>
        {formatNumberForDisplay(numberOfPrizes / totalNumberOfPrizes, {
          style: 'percent',
          minimumFractionDigits: 2
        })}
      </PrizeTableCell>
    </>
  )
}

interface PrizeTableCellProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  index: number
}

const PrizeTableCell = (props: PrizeTableCellProps) => (
  <div
    {...props}
    className={classnames(props.className, 'text-sm xs:text-lg capitalize my-1', {
      'text-flashy font-bold': props.index === 0,
      'opacity-70 text-inverse font-semibold': props.index !== 0
    })}
  />
)
