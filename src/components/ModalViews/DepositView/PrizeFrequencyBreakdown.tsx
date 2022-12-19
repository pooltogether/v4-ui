import { TransparentDiv } from '@components/TransparentDiv'
import { useFormTokenAmount } from '@hooks/useFormTokenAmount'
import { usePrizePoolPrizes } from '@hooks/v4/PrizePool/usePrizePoolPrizes'
import { usePrizePoolTicketTwabTotalSupply } from '@hooks/v4/PrizePool/usePrizePoolTicketTwabTotalSupply'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
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

export const PrizeFrequencyBreakdown = (props: {
  formKey: string
  prizeTier: PrizeTierV2
  className?: string
}) => {
  const { formKey, prizeTier, className } = props
  const prizePool = useSelectedPrizePool()
  const { data: prizeData, isFetched: isPrizesFetched } = usePrizePoolPrizes(prizePool)
  const { data: ticketSupply, isFetched: isTicketSupplyFetched } =
    usePrizePoolTicketTwabTotalSupply(prizePool)
  const { data: tokens } = useSelectedPrizePoolTokens()
  const amountToDeposit = useFormTokenAmount(formKey, tokens?.token)

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

  // TODO: localization

  return (
    <TransparentDiv
      className={classNames(
        'flex flex-col max-w-md text-center px-4 py-2 overflow-y-auto rounded-lg minimal-scrollbar max-h-56',
        className
      )}
    >
      <span className='mb-2 font-bold'>Prize Frequency Breakdown</span>
      <div className='grid grid-cols-2 mb-2'>
        <PrizeTableHeader>Prize Value</PrizeTableHeader>
        <PrizeTableHeader>Estimated Award Time</PrizeTableHeader>
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
              amountToDeposit={amountToDeposit}
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
  amountToDeposit: Amount
}) => {
  const { index, prizeValue, prizeChance, amountToDeposit } = props

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
        <PrettyFrequencyForTier prizeFrequency={prizeFrequency} amountToDeposit={amountToDeposit} />
      </PrizeTableCell>
    </>
  )
}

const PrettyFrequencyForTier = (props: {
  prizeFrequency: { frequency: number; unit: TimeUnit }
  amountToDeposit: Amount
}) => {
  const { prizeFrequency, amountToDeposit } = props
  const { t } = useTranslation()

  // TODO: take into account user deposit and show odds specifically for their deposit size

  const prettyFrequencyString = useMemo(() => {
    if (prizeFrequency.frequency !== 0) {
      if (prizeFrequency.unit === 'day') {
        if (prizeFrequency.frequency <= 1.5) {
          return t('daily')
        } else {
          return t('everyNDays', { n: prizeFrequency.frequency.toFixed(0) })
        }
      } else if (prizeFrequency.unit === 'week') {
        return t('everyNWeeks', { n: prizeFrequency.frequency.toFixed(0) })
      } else if (prizeFrequency.unit === 'month') {
        return t('everyNMonths', { n: prizeFrequency.frequency.toFixed(0) })
      } else {
        return t('everyNYears', { n: prizeFrequency.frequency.toFixed(0) })
      }
    } else {
      return t('never')
    }
  }, [prizeFrequency])

  return <>{prettyFrequencyString}</>
}
