import { PrizeBreakdown } from '@components/PrizeBreakdown'
import { TransparentDiv } from '@components/TransparentDiv'
import { usePrizeDistributorToken } from '@hooks/v4/PrizeDistributor/usePrizeDistributorToken'
import { useSelectedPrizeDistributorToken } from '@hooks/v4/PrizeDistributor/useSelectedPrizeDistributorToken'
import { useSelectedUpcomingPrizeConfig } from '@hooks/v4/PrizeDistributor/useSelectedUpcomingPrizeConfig'

export const PrizeBreakdownCard = () => {
  const { data: prizeConfigData } = useSelectedUpcomingPrizeConfig()
  const { data: prizeTokenData } = useSelectedPrizeDistributorToken()

  return (
    <TransparentDiv className='max-h-40 overflow-y-scroll rounded-lg'>
      <PrizeBreakdown
        prizeConfig={prizeConfigData?.prizeConfig}
        prizeToken={prizeTokenData?.token}
      />
    </TransparentDiv>
  )
}
