import { Dot } from '@components/Dot'
import { PrizePoolBar } from '@components/PrizePoolBar'
import { MinimumDeposit } from '@components/PrizePoolNetwork/MinimumDeposit'
import { PrizePoolTable } from '@components/PrizePoolTable'
import { useAllPrizePoolExpectedPrizes } from '@hooks/v4/PrizePool/useAllPrizePoolExpectedPrizes'
import { usePrizePools } from '@hooks/v4/PrizePool/usePrizePools'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useUpcomingPrizeTier } from '@hooks/v4/PrizePool/useUpcomingPrizeTier'
import { usePrizePoolNetworkGrandPrize } from '@hooks/v4/PrizePoolNetwork/usePrizePoolNetworkGrandPrize'
import { CountUp, ExternalLink } from '@pooltogether/react-components'
import classNames from 'classnames'
import { formatUnits } from 'ethers/lib/utils'
import { useMemo } from 'react'
import { CarouselDescription, CarouselHeader } from '.'

/**
 * Sorted by percentage of picks distributed to the prize pool
 * @param props
 * @returns
 */
export const PerDrawPrizeValue: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const prizePool = useSelectedPrizePool()
  const { data: prizePoolTokens } = usePrizePoolTokens(prizePool)
  const { data: prizeTierData } = useUpcomingPrizeTier(prizePool)

  const prizePools = usePrizePools()
  const queryResults = useAllPrizePoolExpectedPrizes()
  const { data: grandPrizeData, isFetched: isGrandPrizeFetched } = usePrizePoolNetworkGrandPrize()

  const amount = useMemo(() => {
    if (!prizePoolTokens || !prizeTierData) {
      return null
    }
    return formatUnits(prizeTierData.prizeTier.prize, prizePoolTokens.token.decimals)
  }, [prizePoolTokens, prizeTierData])

  const data = useMemo(() => {
    const isFetched = queryResults.some(({ isFetched }) => isFetched)
    if (!isFetched || !isGrandPrizeFetched) {
      return null
    }
    return queryResults
      .filter(({ isFetched }) => isFetched)
      .map(({ data }) => {
        return {
          prizePool: prizePools.find((prizePool) => prizePool.id() === data.prizePoolId),
          percentage: data.percentageOfPicks,
          totalValueOfPrizes: `${Math.round(data.percentageOfPicks * 100)}%`,
          prizes: data.valueOfPrizesFormattedList.join(', ')
        }
      })
      .sort((a, b) => b.percentage - a.percentage)
  }, [prizePools, queryResults, isGrandPrizeFetched])

  return (
    <div className={classNames('relative', className)}>
      <Dots />
      <CarouselHeader
        headers={[
          {
            title: 'Daily Prize Value',
            stat: (
              <span className='text-flashy'>
                $<CountUp countTo={amount} decimals={0} />
              </span>
            )
          }
        ]}
      />
      <CarouselDescription>
        Daily Prize Value is split between all Prize Pools. Every <MinimumDeposit /> has an equal
        chance to win the Grand Prize.{' '}
        <ExternalLink
          underline
          href='https://docs.pooltogether.com/welcome/faq#where-does-the-prize-money-come-from'
        >
          Read more
        </ExternalLink>
      </CarouselDescription>
      <PrizePoolBar
        data={data}
        className='mt-4 sm:mt-8'
        borderClassName='border-white dark:border-pt-purple-darkest'
      />
      <PrizePoolTable
        headers={{ prizes: 'Prizes' }}
        data={data}
        className='mt-2 sm:mt-4 max-w-screen-xs mx-auto'
      />
    </div>
  )
}

const Dots = () => (
  <>
    {/* Left */}
    <Dot className='top-4 left-2' />
    <Dot className='top-0 left-4 xs:left-8' />

    {/* Right */}
    <Dot className='top-4 right-0' />
    <Dot className='top-12 right-8' />
    <Dot className='top-14 right-0 xs:top-0 xs:right-32' />
  </>
)
