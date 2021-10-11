import React from 'react'
import classnames from 'classnames'
import { useTranslation } from 'react-i18next'
import { numberWithCommas } from '@pooltogether/utilities'

import { TSUNAMI_USDC_PRIZE_DISTRIBUTION } from 'lib/constants/prizeDistribution'
import { ViewPrizeTiersTrigger } from 'lib/views/Prizes/DrawCard/DrawDetails'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
// import { getPrettyDate } from 'lib/utils/getNextDrawDate'
// import { useNextDrawDate } from 'lib/hooks/Tsunami/useNextDrawDate'

const AWARD_DAY = 'Friday'

export const UpcomingPrizeCard = (props) => {
  const { t } = useTranslation()

  const { data: prizePool } = useSelectedNetworkPrizePool()
  const { data: prizePoolTokens, isFetched } = usePrizePoolTokens(prizePool)
  // const nextDrawDate = useNextDrawDate()

  const prizeUnformatted = TSUNAMI_USDC_PRIZE_DISTRIBUTION.prize
  const prizePretty = numberWithCommas(prizeUnformatted, {
    decimals: prizePoolTokens?.token.decimals
  })

  const amount = formatNumbers(prizePretty)
  // const amount = prizePretty ? formatNumbers(prizePretty) : weeklyPrizeAmountV3()

  return (
    <div
      className={classnames(
        'relative overflow-visible flex flex-col justify-between text-center bg-prize-amount--small'
      )}
    >
      <div className='lightning-bolts' />
      <div className='border-gradient mx-auto py-4 xs:py-8'>
        <div className='w-2/3 xs:w-1/2 mx-auto leading-none'>
          <h1 className='text-4xl xs:text-10xl xs:-mt-0 font-semibold text-white'>
            {isFetched ? amount : '--'}
          </h1>
          <div className='uppercase font-semibold text-default-soft text-xxs xs:text-lg mt-2'>
            {t?.('inWeeklyPrizes', 'In weekly prizes') || 'In weekly prizes'}
          </div>
        </div>
        <div className='uppercase font-semibold text-highlight-6 text-xxs xs:text-lg w-2/3 xs:w-1/2 mx-auto'>
          {t?.('awardedEveryXDay', {
            day: AWARD_DAY
          }) || `Awarded every ${AWARD_DAY}!`}
        </div>
        <ViewPrizeBreakdownTrigger />
      </div>
    </div>
  )
}

const ViewPrizeBreakdownTrigger = (props) => {
  const { data: prizePool } = useSelectedNetworkPrizePool()
  const { data: prizePoolTokens, isFetched } = usePrizePoolTokens(prizePool)

  return (
    <ViewPrizeTiersTrigger
      token={prizePoolTokens?.token}
      prizeDistribution={TSUNAMI_USDC_PRIZE_DISTRIBUTION}
    />
  )
}

const formatNumbers = (num) => {
  if (num > 1000000) {
    return `$${numberWithCommas(num / 1000000, { precision: 2 })} ${'million'}`
  } else if (num > 10000) {
    return `$${numberWithCommas(num, { precision: 0 })}`
  } else {
    return `$${numberWithCommas(num, { precision: 0 })}`
  }
}
