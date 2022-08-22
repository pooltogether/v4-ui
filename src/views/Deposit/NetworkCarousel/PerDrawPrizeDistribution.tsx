import FeatherIcon from 'feather-icons-react'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useUpcomingPrizeTier } from '@hooks/v4/PrizePool/useUpcomingPrizeTier'
import { CountUp, ExternalLink } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { getChainColorByChainId } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import { formatUnits } from 'ethers/lib/utils'
import { useMemo, useState } from 'react'
import { BigNumber } from 'ethers'
import { useAllPrizePoolTotalNumberOfPrizes } from '@hooks/v4/PrizePool/useAllPrizePoolTotalNumberOfPrizes'
import { Amount } from '@pooltogether/hooks'
import { Dot } from '@components/Dot'

export const PerDrawPrizeDistribution: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const prizePool = useSelectedPrizePool()
  const { data: prizePoolTokens } = usePrizePoolTokens(prizePool)
  const { data: prizeTierData } = useUpcomingPrizeTier(prizePool)

  const queryResults = useAllPrizePoolTotalNumberOfPrizes()

  const amount = useMemo(() => {
    if (!prizePoolTokens || !prizeTierData) {
      return null
    }
    return formatUnits(prizeTierData.prizeTier.prize, prizePoolTokens.token.decimals)
  }, [prizePoolTokens, prizeTierData])

  const prizePools = useMemo(() => {
    const isFetched = queryResults.every(({ isFetched }) => isFetched)
    if (!isFetched) {
      return null
    }
    return queryResults
      .map(({ data }) => data)
      .sort((a, b) => b.percentageOfPicks - a.percentageOfPicks)
  }, [queryResults])

  return (
    <div className={classNames('max-w-xl px-4 xs:px-2 relative', className)}>
      <Dots />
      <div className='flex flex-col font-bold mx-auto text-center'>
        <span>Target USD awarded per draw</span>
        <span className='text-8xl xs:text-12xl leading-none'>
          $
          <CountUp countTo={amount} decimals={0} />
        </span>
      </div>
      <div className='opacity-50 mt-2 text-center'>
        The per draw amount gets split between all of the prize pools.{' '}
        <ExternalLink href='https://docs.pooltogether.com/welcome/faq#where-does-the-prize-money-come-from'>
          Read more
        </ExternalLink>
      </div>
      <PrizePoolBar prizePools={prizePools} className='mt-4' />
      <PrizePoolTable
        amount={prizeTierData?.prizeTier.prize}
        decimals={prizePoolTokens?.token.decimals}
        prizePools={prizePools}
        className='mt-4'
      />
    </div>
  )
}

const PrizePoolBar: React.FC<{
  prizePools: {
    chainId: number
    prizePoolId: string
    numberOfPrizes: number
    percentageOfPicks: number
    totalValueOfPrizes: Amount
  }[]
  className?: string
  commonClassName?: string
}> = (props) => {
  const { prizePools, className, commonClassName } = props

  if (!prizePools || prizePools.length === 0) {
    return (
      <div
        className={classNames(
          className,
          commonClassName,
          'bg-actually-black bg-opacity-10 dark:bg-white dark:bg-opacity-10 animate-pulse'
        )}
      />
    )
  }

  return (
    <div className={classNames(className, commonClassName)}>
      {prizePools?.map(({ prizePoolId, percentageOfPicks, chainId }) => (
        <div
          key={prizePoolId}
          className={classNames('bg-pt-teal text-xxs pl-2')}
          style={{
            width: `${percentageOfPicks * 100}%`,
            background: getChainColorByChainId(chainId)
          }}
        />
      ))}
    </div>
  )
}
PrizePoolBar.defaultProps = {
  commonClassName: 'h-2 w-full rounded-full flex overflow-hidden'
}

const PrizePoolTable: React.FC<{
  amount: BigNumber
  decimals: string
  prizePools: {
    chainId: number
    prizePoolId: string
    numberOfPrizes: number
    percentageOfPicks: number
    totalValueOfPrizes: Amount
  }[]
  className?: string
  commonClassName?: string
}> = (props) => {
  const { prizePools, className, commonClassName } = props

  return (
    <div className={classNames('xs:space-y-1', className, commonClassName)}>
      <div className='w-1/2 ml-auto grid grid-cols-2 text-xxs opacity-50 text-right'>
        <span className=''>Expected value</span>
        <span className=''>& Prizes</span>
      </div>
      {prizePools?.map((data) => (
        <PrizePoolItem key={'ppi-' + data.prizePoolId} {...data} />
      ))}
    </div>
  )
}

const PrizePoolItem: React.FC<{
  chainId: number
  prizePoolId: string
  numberOfPrizes: number
  percentageOfPicks: number
  totalValueOfPrizes: Amount
}> = (props) => {
  const { totalValueOfPrizes, numberOfPrizes, percentageOfPicks, chainId } = props
  const [id] = useState(Math.random())

  return (
    <div className={classNames('flex items-center space-x-2')}>
      <FeatherIcon
        icon={id > 0.5 ? 'triangle' : 'circle'}
        style={{
          color: getChainColorByChainId(chainId),
          scale: `${Math.max(percentageOfPicks + 0.2, 0.4)}`,
          rotate: `${id * 100}deg`
        }}
        className='fill-current'
      />
      <div className='w-full grid grid-cols-2'>
        <div className='grid grid-cols-2'>
          <span>{getNetworkNiceNameByChainId(chainId)}</span>
          <FeatherIcon icon={'arrow-right'} className='w-3 xs:w-4 mx-auto' />
        </div>
        <div className='grid grid-cols-2'>
          <span className='text-right'>${totalValueOfPrizes?.amountPretty}</span>
          <span className='text-right'>{Math.round(numberOfPrizes)}</span>
        </div>
      </div>
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
