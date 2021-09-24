import { useTranslation } from 'react-i18next'
import { Card, LoadingDots } from '.yalc/@pooltogether/react-components/dist'
import React from 'react'

export const UpcomingPrizeCard = (props) => {
  const { t } = useTranslation()

  if (false) {
    return (
      <Card className='hover:bg-secondary trans mb-4'>
        <LoadingDots className='mx-auto my-20' />
      </Card>
    )
  }

  return (
    <Card className='hover:bg-secondary trans mb-4'>
      <div className='font-inter uppercase text-accent-1 text-center'>{t('weeklyPrize')}</div>
      <div className='font-bold text-5xl xs:text-9xl text-center'>$100,000.23</div>
      {/* <div className='font-inter text-accent-1 my-4'>{t('awardIn')}</div> */}
      {/* <PrizeCountdown
        textSize='text-xl'
        t={t}
        prizePeriodSeconds={data.prizePeriodSeconds}
        prizePeriodStartedAt={data.prizePeriodStartedAt}
        isRngRequested={data.isRngRequested}
        canStartAward={data.canStartAward}
        canCompleteAward={data.canCompleteAward}
      /> */}
    </Card>
  )
}
