import { Dot } from '@components/Dot'
import { PrizePoolTable } from '@components/PrizePoolTable'
import { useAllPrizePoolExpectedPrizes } from '@hooks/v4/PrizePool/useAllPrizePoolExpectedPrizes'
import { usePrizePools } from '@hooks/v4/PrizePool/usePrizePools'
import { Amount } from '@pooltogether/hooks'
import { CountUp, ExternalLink } from '@pooltogether/react-components'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import classNames from 'classnames'
import { ethers } from 'ethers'
import { useMemo } from 'react'

export const PerDrawAveragePrizeSize: React.FC<{ className?: string }> = (props) => {
  const { className } = props

  const prizePools = usePrizePools()
  const queryResults = useAllPrizePoolExpectedPrizes()

  const { grandPrizeValue, data } = useMemo(() => {
    const isPrizeCountsFetched = queryResults.some(({ isFetched }) => isFetched)
    const isPrizeTiersFetched = queryResults.some(({ isFetched }) => isFetched)
    if (!isPrizeCountsFetched || !isPrizeTiersFetched) {
      return { data: [], amountOfPrizes: 0 }
    }
    let grandPrizeValue: Amount
    const data = queryResults
      .filter(({ isFetched }) => isFetched)
      .map(({ data }) => {
        if (!grandPrizeValue) {
          grandPrizeValue = data.grandPrizeValue
        } else if (data.grandPrizeValue.amountUnformatted.gt(grandPrizeValue.amountUnformatted)) {
          grandPrizeValue = data.grandPrizeValue
        }

        return {
          prizePool: prizePools.find((prizePool) => prizePool.id() === data.prizePoolId),
          amount: data.averagePrizeValue,
          averagePrizeValue: `$${data.averagePrizeValue.amountPretty}`
        }
      })
      .sort((a, b) => (b.amount.amountUnformatted.gt(a.amount.amountUnformatted) ? 1 : -1))
    return { grandPrizeValue, data }
  }, [queryResults])

  return (
    <div className={classNames('relative', className)}>
      <Dots />
      <div className='flex flex-col font-bold mx-auto text-center'>
        <span>Per Draw Grand Prize</span>
        <span className='text-8xl xs:text-12xl leading-none'>
          $<CountUp countTo={grandPrizeValue?.amount} decimals={0} />
        </span>
      </div>
      <div className='opacity-70 mt-2 text-center'>
        All deposits have a chance to win a grand prize.{' '}
        <ExternalLink
          underline
          href='https://docs.pooltogether.com/welcome/faq#where-does-the-prize-money-come-from'
        >
          Read more
        </ExternalLink>
      </div>
      <PrizePoolTable
        headers={{ averagePrizeValue: 'Average prize value' }}
        data={data}
        className='mt-6'
      />
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
