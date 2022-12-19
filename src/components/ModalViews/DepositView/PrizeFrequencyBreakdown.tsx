import { TransparentDiv } from '@components/TransparentDiv'
import { usePrizePoolPrizes } from '@hooks/v4/PrizePool/usePrizePoolPrizes'
import { usePrizePoolTicketTwabTotalSupply } from '@hooks/v4/PrizePool/usePrizePoolTicketTwabTotalSupply'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { Amount } from '@pooltogether/hooks'
import {
  formatCurrencyNumberForDisplay,
  formatDailyCountToFrequency
} from '@pooltogether/utilities'
import { TimeUnit } from '@pooltogether/utilities/dist/types'
import { PrizeTierV2 } from '@pooltogether/v4-utils-js'
import classNames from 'classnames'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { LoadingPrizeRow, PrizeTableCell, PrizeTableHeader } from './ExpectedPrizeBreakdown'

export const PrizeFrequencyBreakdown = (props: { prizeTier: PrizeTierV2; className?: string }) => {
  const { prizeTier, className } = props
  const prizePool = useSelectedPrizePool()
  const { data: prizeData, isFetched: isPrizesFetched } = usePrizePoolPrizes(prizePool)
  const { data: ticketSupply, isFetched: isTicketSupplyFetched } =
    usePrizePoolTicketTwabTotalSupply(prizePool)
  const { t } = useTranslation()

  const isFetched = isPrizesFetched && isTicketSupplyFetched

  const calculateDprMultiplier = (
    rawDpr: number,
    ticketSupplyAmount: string,
    totalPrizeAmount: string
  ) => {
    const dpr = rawDpr / 10 ** 9
    const tvl = parseFloat(ticketSupplyAmount)
    const prizes = parseFloat(totalPrizeAmount)
    return (dpr * tvl) / prizes
  }

  const prizeChances = useMemo(() => {
    if (isFetched) {
      const dprMultiplier = calculateDprMultiplier(
        prizeTier.dpr,
        ticketSupply.amount.amount,
        prizeData.totalValueOfPrizes.amount
      )
      return prizeData.numberOfPrizesByTier.map((numPrizes) => numPrizes * dprMultiplier)
    }
  }, [isFetched, prizeTier, ticketSupply, prizeData])

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
              prizeChance={prizeChances[i]}
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
