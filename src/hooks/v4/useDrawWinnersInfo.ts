import { getAmountFromUnformatted } from '@pooltogether/utilities'
import { PrizeApi, PrizeDistributor } from '@pooltogether/v4-client-js'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useQueries, useQuery } from 'react-query'
import { useAllLockedDrawIds } from './PrizeDistributor/useAllLockedDrawIds'
import { useAllPrizeDistributorTokens } from './PrizeDistributor/useAllPrizeDistributorTokens'
import { useAllValidDrawIds } from './PrizeDistributor/useAllValidDrawIds'
import {
  getLatestUnlockedDrawId,
  useLatestUnlockedDrawId
} from './PrizeDistributor/useLatestUnlockedDrawId'
import { usePrizeDistributors } from './PrizeDistributor/usePrizeDistributors'
import { usePrizeDistributorToken } from './PrizeDistributor/usePrizeDistributorToken'
import { useValidDrawIds } from './PrizeDistributor/useValidDrawIds'

const getQueryKey = (prizeDistributor: PrizeDistributor, drawId: number) => [
  'useDrawWinnersInfo',
  drawId,
  prizeDistributor.id()
]

export const useAllLatestDrawWinnersInfo = () => {
  const prizeDistributors = usePrizeDistributors()
  const drawIdQueries = useAllValidDrawIds()
  const data = useMemo(
    () =>
      prizeDistributors.map((prizeDistributor) => {
        const drawIds = drawIdQueries.find(
          (query) => query.isFetched && query.data?.prizeDistributorId === prizeDistributor.id()
        )?.data.drawIds

        return {
          prizeDistributor,
          drawId: drawIds?.[drawIds.length - 1]
        }
      }),
    [prizeDistributors, drawIdQueries]
  )
  return useAllDrawWinnersInfo(data)
}

export const useAllLatestUnlockedDrawWinnersInfo = () => {
  const prizeDistributors = usePrizeDistributors()
  const drawIdQueries = useAllValidDrawIds()
  const lockedDrawIds = useAllLockedDrawIds()
  const data = useMemo(
    () =>
      prizeDistributors.map((prizeDistributor) => {
        const drawIds = drawIdQueries.find(
          (query) => query.isFetched && query.data?.prizeDistributorId === prizeDistributor.id()
        )?.data.drawIds

        if (!drawIds || !lockedDrawIds) {
          return {
            prizeDistributor,
            drawId: undefined
          }
        }

        return {
          prizeDistributor,
          drawId: getLatestUnlockedDrawId(drawIds, lockedDrawIds)
        }
      }),
    [prizeDistributors, drawIdQueries, lockedDrawIds]
  )
  return useAllDrawWinnersInfo(data)
}

export const useAllDrawWinnersInfo = (
  data: { prizeDistributor: PrizeDistributor; drawId: number }[]
) => {
  const queryResults = useAllPrizeDistributorTokens()
  const queries = useMemo(
    () =>
      data.map(({ prizeDistributor, drawId }) => {
        const tokenQuery = queryResults.find(
          (qr) => qr.data?.prizeDistributorId === prizeDistributor.id()
        )
        return {
          queryKey: getQueryKey(prizeDistributor, drawId),
          queryFn: () => getDrawStats(prizeDistributor, drawId, tokenQuery?.data?.token.decimals),
          enabled: !!prizeDistributor && !!drawId && !!tokenQuery?.isFetched
        }
      }),
    [data]
  )
  return useQueries(queries)
}

export const useLatestDrawWinnersInfo = (prizeDistributor: PrizeDistributor) => {
  const { data } = useValidDrawIds(prizeDistributor)
  return useDrawWinnersInfo(prizeDistributor, data?.drawIds[data?.drawIds.length - 1])
}

export const useLatestUnlockedDrawWinnersInfo = (prizeDistributor: PrizeDistributor) => {
  const { drawId } = useLatestUnlockedDrawId(prizeDistributor)
  return useDrawWinnersInfo(prizeDistributor, drawId)
}

export const useDrawWinnersInfo = (prizeDistributor: PrizeDistributor, drawId: number) => {
  const { data, isFetched } = usePrizeDistributorToken(prizeDistributor)
  return useQuery(
    getQueryKey(prizeDistributor, drawId),
    () => getDrawStats(prizeDistributor, drawId, data?.token.decimals),
    {
      enabled: !!prizeDistributor && !!drawId && !!isFetched
    }
  )
}

// TODO: THIS NEEDS DECIMALS TO FORMAT THE AMOUNT CORRECTLY
const getDrawStats = async (
  prizeDistributor: PrizeDistributor,
  _drawId: number,
  decimals: string
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
    chainId: prizeDistributor.chainId,
    prizesWon: data.meta.prizeLength,
    amount: getAmountFromUnformatted(BigNumber.from(data.meta.amountsTotal), decimals),
    prizeDistributorId: prizeDistributor.id(),
    drawId
  }
}
