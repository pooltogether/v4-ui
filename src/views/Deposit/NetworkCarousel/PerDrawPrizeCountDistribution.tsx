import { CountUp, ExternalLink } from '@pooltogether/react-components'
import classNames from 'classnames'
import { useMemo } from 'react'
import { useAllPrizePoolExpectedPrizes } from '@hooks/v4/PrizePool/useAllPrizePoolExpectedPrizes'
import { Dot } from '@components/Dot'
import { usePrizePools } from '@hooks/v4/PrizePool/usePrizePools'
import { PrizePoolBar } from '@components/PrizePoolBar'
import { PrizePoolTable } from '@components/PrizePoolTable'

export const PerDrawPrizeCountDistribution: React.FC<{ className?: string }> = (props) => {
  const { className } = props

  const prizePools = usePrizePools()
  const queryResults = useAllPrizePoolExpectedPrizes()
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
          prizes: Math.round(data.expectedTotalNumberOfPrizes),
          percentage: data.expectedTotalNumberOfPrizes / totalAmountOfPrizes
        }
      })
      .sort((a, b) => b.prizes - a.prizes)
    return { totalAmountOfPrizes, data }
  }, [queryResults])

  return (
    <div className={classNames('max-w-xl px-4 xs:px-2 relative', className)}>
      <Dots />
      <div className='flex flex-col font-bold mx-auto text-center'>
        <span>Estimated number of prizes per draw</span>
        <span className='text-8xl xs:text-12xl leading-none'>
          <CountUp countTo={totalAmountOfPrizes} decimals={0} />
        </span>
      </div>
      <div className='opacity-70 mt-2 text-center'>
        Prize pools determine how they want to split up their prize money allocation.{' '}
        <ExternalLink href='https://docs.pooltogether.com/welcome/faq#where-does-the-prize-money-come-from'>
          Read more
        </ExternalLink>
      </div>
      <PrizePoolBar
        data={data}
        className='mt-4'
        borderClassName='border-white dark:border-pt-purple-darkest'
      />
      <PrizePoolTable headers={{ prizes: 'Estimated prizes' }} data={data} className='mt-2' />
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
