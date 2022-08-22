import { useSelectedPrizeDistributorToken } from '@hooks/v4/PrizeDistributor/useSelectedPrizeDistributorToken'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useUpcomingPrizeTier } from '@hooks/v4/PrizePool/useUpcomingPrizeTier'
import { Carousel } from '@pooltogether/react-components'
import { UpcomingPrize } from './UpcomingPrize'
import { PrizeBreakdown as PrizeBreakdownTable } from '@components/PrizeBreakdown'
import { PerDrawPrizeDistribution } from './PerDrawPrizeDistribution'
import { LastDrawWinners } from './LastDrawWinners'
import FeatherIcon from 'feather-icons-react'
import classNames from 'classnames'

export const NetworkCarousel = () => {
  return (
    <Carousel
      marginClassName=''
      className='pb-2'
      settings={{
        arrows: true,
        dots: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />
      }}
    >
      <UpcomingPrize className='mx-auto' />
      <LastDrawWinners className='mx-auto' />
      <PerDrawPrizeDistribution className='mx-auto' />
    </Carousel>
  )
}

const PrevArrow = (props) => {
  const { className, style, onClick } = props
  return (
    <button className={className} onClick={onClick}>
      <FeatherIcon
        className={'w-5 h-5 xs:w-6 xs:h-6 lg:w-8 lg:h-8 mr-auto text-inverse'}
        style={{ ...style }}
        icon='chevron-left'
      />
    </button>
  )
}

const NextArrow = (props) => {
  const { className, style, onClick } = props
  return (
    <button className={className} onClick={onClick}>
      <FeatherIcon
        className={'w-5 h-5 xs:w-6 xs:h-6 lg:w-8 lg:h-8 ml-auto text-inverse'}
        style={{ ...style }}
        icon='chevron-right'
      />
    </button>
  )
}

const PrizeBreakdown = () => {
  const prizePool = useSelectedPrizePool()
  const { data: prizeTierData } = useUpcomingPrizeTier(prizePool)
  const { data: prizeTokenData } = useSelectedPrizeDistributorToken()
  return <PrizeBreakdownTable prizeTier={prizeTierData?.prizeTier} ticket={prizeTokenData?.token} />
}
