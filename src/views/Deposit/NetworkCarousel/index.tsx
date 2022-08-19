import { useSelectedPrizeDistributorToken } from '@hooks/v4/PrizeDistributor/useSelectedPrizeDistributorToken'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useUpcomingPrizeTier } from '@hooks/v4/PrizePool/useUpcomingPrizeTier'
import { Carousel } from '@pooltogether/react-components'
import { UpcomingPrize } from './UpcomingPrize'
import { PrizeBreakdown as PrizeBreakdownTable } from '@components/PrizeBreakdown'
import { PerDrawPrizeDistribution } from './PerDrawPrizeDistribution'
import { LastDrawWinners } from './LastDrawWinners'

export const NetworkCarousel = () => {
  return (
    <Carousel marginClassName='' className='pb-2'>
      <UpcomingPrize className='mx-auto' />
      <PerDrawPrizeDistribution className='mx-auto' />
      {/* <LastDrawWinners className='mx-auto' /> */}
    </Carousel>
  )
}

const PrizeBreakdown = () => {
  const prizePool = useSelectedPrizePool()
  const { data: prizeTierData } = useUpcomingPrizeTier(prizePool)
  const { data: prizeTokenData } = useSelectedPrizeDistributorToken()
  return <PrizeBreakdownTable prizeTier={prizeTierData?.prizeTier} ticket={prizeTokenData?.token} />
}
