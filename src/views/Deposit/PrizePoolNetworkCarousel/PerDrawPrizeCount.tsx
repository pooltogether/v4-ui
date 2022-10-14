import { Dot } from '@components/Dot'
import { PrizePoolBar } from '@components/PrizePoolBar'
import { PrizePoolTable } from '@components/PrizePoolTable'
import { useAllPrizePoolExpectedPrizes } from '@hooks/v4/PrizePool/useAllPrizePoolExpectedPrizes'
import { usePrizePools } from '@hooks/v4/PrizePool/usePrizePools'
import { useAllDrawWinners, useAllLatestDrawWinners } from '@hooks/v4/useDrawWinners'
import { CountUp, ExternalLink } from '@pooltogether/react-components'
import classNames from 'classnames'
import { useMemo } from 'react'
import { CarouselDescription, CarouselHeader } from '.'

export const PerDrawPrizeCount: React.FC<{ className?: string }> = (props) => {
  const { className } = props

  const prizePools = usePrizePools()
  const queryResults = useAllPrizePoolExpectedPrizes()
  const winnersQueryResults = useAllLatestDrawWinners()

  const { totalAmountOfPrizes, data } = useMemo(() => {
    const isFetched = queryResults.some(({ isFetched }) => isFetched)
    if (!isFetched) {
      return { data: [], totalAmountOfPrizes: 0 }
    }
    const totalAmountOfPrizes = Math.round(
      queryResults
        .filter(({ isFetched }) => isFetched)
        .reduce((sum, { data }) => sum + data.expectedTotalNumberOfPrizes, 0)
    )
    const data = queryResults
      .filter(({ isFetched }) => isFetched)
      .map(({ data }) => {
        return {
          prizePool: prizePools.find((prizePool) => prizePool.id() === data.prizePoolId),
          numberOfPrizes: Math.round(data.expectedTotalNumberOfPrizes),
          prizes: data.valueOfPrizesFormattedList.join(', '),
          percentage: data.expectedTotalNumberOfPrizes / totalAmountOfPrizes
        }
      })
      .sort((a, b) => b.numberOfPrizes - a.numberOfPrizes)
    return { totalAmountOfPrizes, data }
  }, [queryResults])

  const numberOfWinnersLastDraw = useMemo(() => {
    const isFetched = winnersQueryResults.some(({ isFetched }) => isFetched)
    if (!isFetched) {
      return 0
    }

    return winnersQueryResults.reduce(
      (sum, { data, isFetched }) => (isFetched ? sum + data.prizes.length : sum),
      0
    )
  }, [winnersQueryResults])

  return (
    <div className={classNames('relative', className)}>
      <Dots />
      <CarouselHeader
        headers={[
          {
            title: 'Prizes next draw',
            stat: (
              <>
                <CountUp countTo={totalAmountOfPrizes} decimals={0} />
              </>
            )
          },
          {
            title: 'Prizes won last draw',
            stat: (
              <span className='text-flashy'>
                <CountUp countTo={numberOfWinnersLastDraw} decimals={0} />
              </span>
            )
          }
        ]}
      />
      <CarouselDescription>
        Some Prize Pools have many small prizes, others have a few big prizes.{' '}
        <ExternalLink
          underline
          href='https://docs.pooltogether.com/welcome/faq#where-does-the-prize-money-come-from'
        >
          Read more
        </ExternalLink>
      </CarouselDescription>
      <PrizePoolBar
        data={data}
        className='mt-4'
        borderClassName='border-white dark:border-pt-purple-darkest'
      />
      <PrizePoolTable headers={{ prizes: 'Prizes' }} data={data} className='mt-2' />
    </div>
  )
}

const Dots = () => (
  <>
    {/* Left */}
    <Dot className='top-2 left-0' />
    <Dot className='top-10 left-6 xs:left-12' />
    <Dot className='top-20 xs:-top-2 left-20' />

    {/* Right */}
    <Dot className='top-4 right-0' />
    <Dot className='top-12 right-8' />
    <Dot className='top-14 right-0  xs:right-32' />
  </>
)
