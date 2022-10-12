import { Dot } from '@components/Dot'
import { PrizePoolBar } from '@components/PrizePoolBar'
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
        const prizes = [
          // @ts-ignore
          ...new Set(
            data.valueOfPrizesByTier
              .filter(
                (p) =>
                  !p.amountUnformatted.isZero() &&
                  !p.amountUnformatted.eq(grandPrizeData.grandPrizeValue.amountUnformatted)
              )
              .map((p) => `$${p.amountPretty}`)
          )
        ].join(', ')

        return {
          prizePool: prizePools.find((prizePool) => prizePool.id() === data.prizePoolId),
          percentage: data.percentageOfPicks,
          totalValueOfPrizes: `${Math.round(data.percentageOfPicks * 100)}%`,
          prizes
        }
      })
      .sort((a, b) => b.percentage - a.percentage)
  }, [prizePools, queryResults, isGrandPrizeFetched])

  return (
    <div className={classNames('relative', className)}>
      <Dots />
      <div className='grid grid-cols-2 mx-auto font-bold text-center max-w-screen-xs'>
        <div className='flex flex-col'>
          <span>Total Prize Value</span>
          <span className='text-7xl xs:text-12xl leading-none'>
            $
            <CountUp countTo={amount} decimals={0} />
          </span>
        </div>
        <div className='flex flex-col'>
          <span>Grand Prize Value</span>
          <span className='text-7xl xs:text-12xl leading-none text-flashy'>
            $<CountUp countTo={grandPrizeData?.grandPrizeValue.amount} decimals={0} />
          </span>
        </div>
      </div>
      {/* <div className='flex flex-col font-bold mx-auto text-center'>
        <span>USD Awarded Daily</span>
        <span className='text-8xl xs:text-12xl leading-none'>
          $
          <CountUp countTo={amount} decimals={0} />
        </span>
      </div> */}
      <div className='opacity-70 mt-2 text-center'>
        Total Prize Value is split between all Prize Pools. Every deposit has a chance to win the
        Grand Prize.{' '}
        <ExternalLink
          underline
          href='https://docs.pooltogether.com/welcome/faq#where-does-the-prize-money-come-from'
        >
          Read more
        </ExternalLink>
      </div>
      <PrizePoolBar
        data={data}
        className='mt-4'
        borderClassName='border-white dark:border-pt-purple-darkest'
      />
      <PrizePoolTable headers={{ prizes: 'Small Prizes' }} data={data} className='mt-2' />
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
