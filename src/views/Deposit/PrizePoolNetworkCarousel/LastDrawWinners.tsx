import TrophyIcon from '@assets/images/pooltogether-trophy--detailed.png'
import { Dot } from '@components/Dot'
import { useAllValidDrawIds } from '@hooks/v4/PrizeDistributor/useAllValidDrawIds'
import { usePrizeDistributors } from '@hooks/v4/PrizeDistributor/usePrizeDistributors'
import { usePrizeDistributorToken } from '@hooks/v4/PrizeDistributor/usePrizeDistributorToken'
import { useSelectedPrizeDistributor } from '@hooks/v4/PrizeDistributor/useSelectedPrizeDistributor'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { Amount } from '@pooltogether/hooks'
import { NetworkIcon, PoolIcon } from '@pooltogether/react-components'
import { getAmount, getAmountFromUnformatted } from '@pooltogether/utilities'
import { PrizeApi, PrizeDistributor } from '@pooltogether/v4-client-js'
import { CHAIN_ID } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import { ethers } from 'ethers'
import { useMemo } from 'react'
import { useQueries } from 'react-query'

export const LastDrawWinners: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const prizeDistributor = useSelectedPrizeDistributor()
  const prizePool = useSelectedPrizePool()
  const { data: prizeDistributorTokenData } = usePrizeDistributorToken(prizeDistributor)
  const queryResults = useAllLastDrawWinners()

  const { isFetched, totalAmountWon, totalPrizesWon } = useMemo<{
    isFetched: boolean
    isPartiallyFetched: boolean
    totalAmountWon: Amount
    totalPrizesWon: number
  }>(() => {
    const isFetched = queryResults.every(({ isFetched }) => isFetched)
    const isPartiallyFetched = queryResults.some(({ isFetched }) => isFetched)
    if (!isPartiallyFetched) {
      return {
        isFetched,
        isPartiallyFetched,
        totalAmountWon: null,
        totalPrizesWon: null
      }
    }
    // NOTE: Assumes all tokens are the same decimals
    // We will need to migrate this to a fiat value in the near future.
    const decimals = prizeDistributorTokenData?.token.decimals
    const { totalAmountWon, totalPrizesWon } = queryResults.reduce(
      (totalData, { isError, isFetched, data }) => {
        if (!isFetched || isError || !data) {
          return totalData
        }
        totalData.totalAmountWon = totalData.totalAmountWon.add(data.amount.amountUnformatted)
        totalData.totalPrizesWon = totalData.totalPrizesWon + data.prizesWon
        return totalData
      },
      { totalAmountWon: ethers.constants.Zero, totalPrizesWon: 0 }
    )
    return {
      isFetched,
      isPartiallyFetched,
      totalAmountWon: getAmountFromUnformatted(totalAmountWon, decimals),
      totalPrizesWon: totalPrizesWon
    }
  }, [queryResults, prizeDistributorTokenData])

  return (
    <div className={classNames('max-w-lg py-8 relative', className)}>
      <Art />
      <div className='flex flex-col xs:ml-20 max-w-xs mx-auto'>
        <span className='opacity-70'>Last draw</span>
        <div className='flex mb-4'>
          <span className='text-8xl xs:text-12xl leading-none'>{totalPrizesWon}</span>
          <span className='mt-auto opacity-70'>prizes won</span>
        </div>
        <div className='flex flex-col'>
          <span className='opacity-70'>totalling</span>
          <span className='text-12xl xs:text-14xl leading-none'>
            ${totalAmountWon?.amountPretty}
          </span>
        </div>
      </div>
    </div>
  )
}

const getQueryKey = (prizeDistributor: PrizeDistributor) => [
  'useLastDrawWinners',
  prizeDistributor.id()
]

const useAllLastDrawWinners = () => {
  const prizeDistributors = usePrizeDistributors()
  const drawIdQueries = useAllValidDrawIds()
  const queries = useMemo(
    () =>
      prizeDistributors.map((prizeDistributor) => {
        const drawIds = drawIdQueries.find(
          (query) => query.isFetched && query.data?.prizeDistributorId === prizeDistributor.id()
        )?.data.drawIds

        return {
          queryKey: getQueryKey(prizeDistributor),
          queryFn: () => getLastDrawStats(prizeDistributor, drawIds?.[drawIds.length - 1]),
          enabled: !!drawIds
        }
      }),
    [prizeDistributors, drawIdQueries]
  )
  return useQueries(queries)
}

const getLastDrawStats = async (prizeDistributor: PrizeDistributor, _drawId: number) => {
  let drawId = _drawId
  const fetchData = (drawId: number) =>
    fetch(
      PrizeApi.getDrawResultsStatusUrl(prizeDistributor.chainId, prizeDistributor.address, drawId)
    )
  let response = await fetchData(drawId)
  let data: {
    meta: {
      prizeLength: number
      amountsTotal: string
    }
  }

  try {
    data = await response.json()
  } catch (e) {
    try {
      drawId = drawId - 1
      response = await fetchData(drawId)
      data = await response.json()
    } catch (e) {
      console.log(e)
      throw new Error('Could not fetch draw results')
    }
  }

  return {
    prizesWon: data.meta.prizeLength,
    amount: getAmount(data.meta.amountsTotal, '0'),
    drawId
  }
}

const Art = () => (
  <>
    {/* Trophy */}
    <img src={TrophyIcon} className='w-16 absolute right-2 top-20 transform rotate-3' />
    <Dot className='top-4 -right-4 xs:-top-8 xs:-right-12' />
    <Dot className='top-0 -right-6' />
    <Dot className='top-8 right-0' />
    <Dot className='top-8 -right-4' />
    <Dot className='top-10 right-12' />
    <Dot className='top-12 right-8' />
    <Dot className='top-14 right-4' />
    <Dot className='top-16 right-10' />
    <Dot className='bottom-20 -right-2 xs:-right-8 sm:-right-20' />

    <NetworkIcon
      chainId={CHAIN_ID.mainnet}
      sizeClassName='w-8 h-8 xs:w-12 xs:h-12'
      className='absolute -top-4 xs:top-0 -left-4 transform -rotate-6'
    />
    <NetworkIcon
      chainId={CHAIN_ID.polygon}
      sizeClassName='w-8 h-8  xs:w-10 xs:h-10'
      className='absolute right-16 -top-8'
    />
    <NetworkIcon
      chainId={CHAIN_ID.avalanche}
      sizeClassName='w-8 h-8'
      className='absolute right-12 -top-3'
    />
    <NetworkIcon
      chainId={CHAIN_ID.optimism}
      sizeClassName='w-10 h-10 sm:w-14 sm:h-14'
      className='absolute top-12 right-20 xs:right-28 transform rotate-6'
    />
    <PoolIcon
      sizeClassName='w-10 h-10 sm:w-14 sm:h-14'
      className='absolute top-28 -right-10 xs:-right-12 sm:-right-28 transform rotate-6'
    />

    <span className='absolute top-0 right-0 transform -rotate-6'>🥳</span>
    <span className='absolute top-8 right-5 transform -rotate-4'>🥳</span>
    <span className='absolute top-6 right-12 transform '>🎉</span>

    {/* Left */}
    <Dot className='top-0 -left-2 xs:-left-6' />
    <Dot className='-top-4 left-12' />
    <Dot className='top-0 left-24' />
    <Dot className='top-8 sm:top-12 -left-4 xs:-left-8' />

    {/* Right */}
  </>
)
