import FeatherIcon from 'feather-icons-react'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useUpcomingPrizeTier } from '@hooks/v4/PrizePool/useUpcomingPrizeTier'
import { CountUp, ExternalLink } from '@pooltogether/react-components'
import { divideBigNumbers, getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { getChainColorByChainId } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import { formatUnits, parseEther } from 'ethers/lib/utils'
import { useMemo, useState } from 'react'
import { BigNumber } from 'ethers'
import { useAllPrizePoolExpectedPrizes } from '@hooks/v4/PrizePool/useAllPrizePoolExpectedPrizes'
import { Amount } from '@pooltogether/hooks'
import { Dot } from '@components/Dot'
import { PrizePoolPickDistributionBar } from '@components/PrizePoolBar/PrizePoolPickDistributionBar'
import { usePrizePools } from '@hooks/v4/PrizePool/usePrizePools'
import { PrizePoolBar } from '@components/PrizePoolBar'
import { PrizePoolTable } from '@components/PrizePoolTable'
import { usePrizePoolNetworkTicketTotalSupply } from '@hooks/v4/PrizePoolNetwork/usePrizePoolNetworkTicketTotalSupply'
import { useAllPrizePoolTicketTotalSupplies } from '@hooks/v4/PrizePool/useAllPrizePoolTicketTotalSupplies'

export const PrizePoolNetworkTvl: React.FC<{ className?: string }> = (props) => {
  const { className } = props

  const prizePools = usePrizePools()
  const queryResults = useAllPrizePoolTicketTotalSupplies()
  const { data: tvl } = usePrizePoolNetworkTicketTotalSupply()

  const data = useMemo(() => {
    const isFetched = queryResults.every(({ isFetched }) => isFetched)
    if (!isFetched || !tvl) {
      return []
    }

    return queryResults
      .filter(({ isFetched }) => isFetched)
      .map(({ data }) => {
        return {
          prizePool: prizePools.find((prizePool) => prizePool.id() === data.prizePoolId),
          tvl: `$${data.amount.amountPretty}`,
          amount: data.amount,
          percentage: divideBigNumbers(
            parseEther(data.amount.amount),
            tvl.totalSupply.amountUnformatted
          )
        }
      })
      .sort((a, b) => (b.amount.amountUnformatted.gt(a.amount.amountUnformatted) ? 1 : -1))
  }, [queryResults, tvl])

  return (
    <div className={classNames('max-w-xl px-4 xs:px-2 relative', className)}>
      <Dots />
      <div className='flex flex-col font-bold mx-auto text-center'>
        <span>Prize Pool Network Total Value Locked</span>
        <span className='text-8xl xs:text-12xl leading-none'>
          $<CountUp countTo={tvl?.totalSupply.amount} decimals={0} />
        </span>
      </div>
      <div className='opacity-50 mt-2 text-center'>
        Prize money is distributed to prize pools based on their TVL{' '}
        <ExternalLink href='https://docs.pooltogether.com/welcome/faq#where-does-the-prize-money-come-from'>
          Read more
        </ExternalLink>
      </div>
      <PrizePoolBar
        data={data}
        className='mt-4'
        borderClassName='border-white dark:border-pt-purple-darkest'
      />
      <PrizePoolTable headers={{ tvl: 'TVL' }} data={data} className='mt-2' />
    </div>
  )
}

const Dots = () => (
  <>
    {/* Left */}
    <Dot className='top-12 left-4' />
    <Dot className='top-10 left-6 xs:left-12' />
    <Dot className='top-20 xs:-top-2 left-20' />

    {/* Right */}
    <Dot className='top-4 right-0' />
    <Dot className='top-12 right-4' />
    <Dot className='top-14 right-0 xs:top-0 xs:right-28' />
  </>
)
