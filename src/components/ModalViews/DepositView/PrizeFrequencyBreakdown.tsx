import { TransparentDiv } from '@components/TransparentDiv'
import { usePrizePoolExpectedPrizes } from '@hooks/v4/PrizePool/usePrizePoolExpectedPrizes'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { Amount } from '@pooltogether/hooks'
import {
  formatCurrencyNumberForDisplay,
  formatDailyCountToFrequency
} from '@pooltogether/utilities'
import { TimeUnit } from '@pooltogether/utilities/dist/types'
import classNames from 'classnames'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { LoadingPrizeRow, PrizeTableCell, PrizeTableHeader } from './ExpectedPrizeBreakdown'

export const PrizeFrequencyBreakdown = (props: { className?: string }) => {
  const { className } = props
  const prizePool = useSelectedPrizePool()
  const { data: prizeData, isFetched } = usePrizePoolExpectedPrizes(prizePool)
  const { t } = useTranslation()

  return (
    <TransparentDiv
      className={classNames(
        'flex flex-col max-w-md text-center px-4 py-2 overflow-y-auto rounded-lg minimal-scrollbar max-h-56',
        className
      )}
    >
      <span className='font-bold'>{t('estimatedPrizeFrequencyBreakdown')}</span>
      <span className='mb-2 text-xxxs opacity-60'>{t('prizeFrequencyBreakdownDescription')}</span>
      <div className='grid grid-cols-2 mb-2'>
        <PrizeTableHeader>{t('prizeValue')}</PrizeTableHeader>
        <PrizeTableHeader>{t('awardTime')}</PrizeTableHeader>
      </div>

      {!isFetched ? (
        <>
          <LoadingPrizeRow />
          <LoadingPrizeRow />
          <LoadingPrizeRow />
        </>
      ) : (
        <ul className='grid grid-cols-2 gap-3'>
          {prizeData.prizeTier?.tiers.map((_, i) => (
            <PrizeFrequencyBreakdownTableRow
              key={`prize_freq_row_${i}`}
              index={i}
              prizeValue={prizeData.valueOfPrizesByTier[i]}
              prizeChance={prizeData.expectedNumberOfPrizesByTier[i]}
            />
          ))}
        </ul>
      )}
    </TransparentDiv>
  )
}

const PrizeFrequencyBreakdownTableRow = (props: {
  index: number
  prizeValue: Amount
  prizeChance: number
}) => {
  const { index, prizeValue, prizeChance } = props

  // This assumes there is one draw every day:
  const prizeFrequency = formatDailyCountToFrequency(prizeChance)

  if (prizeValue.amountUnformatted.isZero()) return null

  return (
    <>
      <PrizeTableCell index={index}>
        {formatCurrencyNumberForDisplay(prizeValue.amount, 'usd', {
          hideZeroes: true
        })}
      </PrizeTableCell>
      <PrizeTableCell index={index}>
        <PrettyFrequencyForTier frequency={prizeFrequency.frequency} unit={prizeFrequency.unit} />
      </PrizeTableCell>
    </>
  )
}

const PrettyFrequencyForTier = (props: { frequency: number; unit: TimeUnit }) => {
  const { frequency, unit } = props
  const { t } = useTranslation()

  const prettyFrequencyString = useMemo(() => {
    if (frequency !== 0) {
      if (unit === 'day') {
        if (frequency <= 1.5) {
          return t('daily')
        } else {
          return t('everyNDays', { n: frequency.toFixed(0) })
        }
      } else if (unit === 'week') {
        return t('everyNWeeks', { n: frequency.toFixed(0) })
      } else if (unit === 'month') {
        return t('everyNMonths', { n: frequency.toFixed(0) })
      } else {
        return t('everyNYears', { n: frequency.toFixed(0) })
      }
    } else {
      return t('never')
    }
  }, [frequency, unit])

  return <>{prettyFrequencyString}</>
}
