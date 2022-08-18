import { PrizeBreakdown } from '@components/PrizeBreakdown'
import { TransparentDiv } from '@components/TransparentDiv'
import { useSelectedPrizeDistributorToken } from '@hooks/v4/PrizeDistributor/useSelectedPrizeDistributorToken'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useUpcomingPrizeTier } from '@hooks/v4/PrizePool/useUpcomingPrizeTier'

export const PrizeBreakdownCard = () => {
  const prizePool = useSelectedPrizePool()
  const { data: prizeTierData } = useUpcomingPrizeTier(prizePool)
  const { data: prizeTokenData } = useSelectedPrizeDistributorToken()

  return (
    <TransparentDiv className='max-h-40 overflow-y-scroll rounded-lg'>
      <PrizeBreakdown prizeTier={prizeTierData?.prizeTier} ticket={prizeTokenData?.token} />
    </TransparentDiv>
  )
}
