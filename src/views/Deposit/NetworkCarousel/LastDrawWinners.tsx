import { useAllPrizeDistributorTokens } from '@hooks/v4/PrizeDistributor/useAllPrizeDistributorTokens'
import { useAllValidDrawIds } from '@hooks/v4/PrizeDistributor/useAllValidDrawIds'
import { usePrizeDistributors } from '@hooks/v4/PrizeDistributor/usePrizeDistributors'
import { usePrizeDistributorToken } from '@hooks/v4/PrizeDistributor/usePrizeDistributorToken'
import { useSelectedPrizeDistributor } from '@hooks/v4/PrizeDistributor/useSelectedPrizeDistributor'
import { useValidDrawIds } from '@hooks/v4/PrizeDistributor/useValidDrawIds'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useUpcomingPrizeTier } from '@hooks/v4/PrizePool/useUpcomingPrizeTier'
import { Amount, Token } from '@pooltogether/hooks'
import { numberWithCommas } from '@pooltogether/utilities'
import { PrizeApi, PrizeDistributor, PrizePool } from '@pooltogether/v4-client-js'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { getAmountFromString } from '@utils/getAmountFromString'
import { OddsOfWinningWithX } from '@views/Account/SidebarCard/OddsSidebarCard'
import classNames from 'classnames'
import { ethers } from 'ethers'
import { useMemo } from 'react'
import { useQueries } from 'react-query'
import { useQuery } from 'wagmi'

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
    return {
      isFetched: true,
      isPartiallyFetched: true,
      totalAmountWon: getAmountFromBigNumber(ethers.constants.Zero, '6'),
      totalPrizesWon: 0
    }

    // const isFetched = queryResults.every(({ isFetched }) => isFetched)
    // const isPartiallyFetched = queryResults.some(({ isFetched }) => isFetched)
    // if (!isPartiallyFetched) {
    //   return {
    //     isFetched,
    //     isPartiallyFetched,
    //     totalAmountWon: null,
    //     totalPrizesWon: null
    //   }
    // }
    // // NOTE: Assumes all tokens are the same decimals
    // // We will need to migrate this to a fiat value in the near future.
    // const decimals = prizeDistributorTokenData?.token.decimals
    // const data = queryResults.reduce(
    //   (totalData, { isError, isFetched, data }) => {
    //     if (!isFetched || isError) {
    //       return totalData
    //     }
    //     totalData.totalAmountWon = totalData.totalAmountWon.add(data.amount.amountUnformatted)
    //     totalData.totalPrizesWon = totalData.totalPrizesWon + data.prizesWon
    //     return totalData
    //   },
    //   { totalAmountWon: ethers.constants.Zero, totalPrizesWon: 0 }
    // )
    // return {
    //   isFetched,
    //   isPartiallyFetched,
    //   totalAmountWon: getAmountFromBigNumber(data.totalAmountWon, decimals),
    //   totalPrizesWon: data.totalPrizesWon
    // }
    // }, [queryResults])
  }, [])

  return (
    <div className={classNames('max-w-md', className)}>
      <div className='flex flex-col'>
        <span>Last draw</span>
        <div>
          <span className='text-8xl xs:text-12xl leading-none'>{totalPrizesWon}</span>
          <span>prizes won</span>
        </div>
        <span>totalling</span>
        <span className='text-8xl xs:text-12xl leading-none'>${totalAmountWon?.amountPretty}</span>
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
  const tokenQueries = useAllPrizeDistributorTokens()
  const queries = useMemo(
    () =>
      prizeDistributors.map((prizeDistributor) => {
        const drawIds = drawIdQueries.find(
          (query) => query.isFetched && query.data?.prizeDistributorId === prizeDistributor.id()
        )?.data.drawIds

        const token = tokenQueries.find(
          (query) => query.isFetched && query.data?.prizeDistributorId === prizeDistributor.id()
        )?.data.token

        return {
          queryKey: getQueryKey(prizeDistributor),
          queryFn: () => getLastDrawStats(prizeDistributor, drawIds?.[drawIds.length - 1], token)
        }
      }),
    [prizeDistributors, tokenQueries, drawIdQueries]
  )
  return useQueries(queries)
}

const useLastDrawWinners = (prizeDistributor: PrizeDistributor) => {
  const { data, isFetched } = useValidDrawIds(prizeDistributor)
  const { data: tokenData, isFetched: isTokenDataFetched } =
    usePrizeDistributorToken(prizeDistributor)

  return useQuery(
    getQueryKey(prizeDistributor),
    () =>
      getLastDrawStats(prizeDistributor, data?.drawIds[data?.drawIds.length - 1], tokenData.token),
    { enabled: isFetched && isTokenDataFetched }
  )
}

const getLastDrawStats = async (
  prizeDistributor: PrizeDistributor,
  _drawId: number,
  token: Token
) => {
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
    amount: getAmountFromString(data.meta.amountsTotal, token.decimals),
    drawId
  }
}
