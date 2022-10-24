import { Trans, useTranslation } from 'next-i18next'
import { LargestPrizeInNetwork } from './PrizePoolNetwork/LargestPrizeInNetwork'
import { TotalNumberOfPrizes } from './PrizePoolNetwork/TotalNumberOfPrizes'
import { UpcomingPerDrawPrizeValue } from './PrizePoolNetwork/UpcomingPerDrawPrizeValue'

export const PoolTogetherExplainerWithStats = () => {
  const { t } = useTranslation()
  return (
    <>
      <Trans
        i18nKey={'howDoIWinExplainer'}
        components={{
          prizeFrequency: t('daily'),
          numberOfPrizes: <TotalNumberOfPrizes />,
          perDrawPrizeValue: <UpcomingPerDrawPrizeValue />,
          grandPrizeValue: <LargestPrizeInNetwork />,
          style: <b className='text-flashy' />,
          b: <b />
        }}
      />
    </>
  )
}
