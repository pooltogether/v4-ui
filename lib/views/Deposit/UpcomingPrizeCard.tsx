import { useTranslation } from 'react-i18next'
import { LoadingDots } from '.yalc/@pooltogether/react-components/dist'

export const UpcomingPrizeCard = (props) => {
  const { t } = useTranslation()

  if (false) {
    return (
      <div className='bg-card hover:bg-secondary trans rounded-lg w-full p-10 flex flex-col mb-4 items-center'>
        <LoadingDots className='mx-auto my-20' />
      </div>
    )
  }

  return (
    <div className='bg-card hover:bg-secondary trans rounded-lg w-full p-10 flex flex-col mb-4 items-center'>
      <div className='font-inter uppercase text-accent-1'>{t('weeklyPrize')}</div>
      <div className='font-bold text-5xl xs:text-9xl'>$100,000.23</div>
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
    </div>
  )
}
