import { getAmountFromBigNumber } from '@pooltogether/hooks'
import { PrizeApi, PrizeDistributor } from '@pooltogether/v4-client-js'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useQueries, useQuery } from 'react-query'
import { useAllPrizeDistributorTokens } from './PrizeDistributor/useAllPrizeDistributorTokens'
import { useAllValidDrawIds } from './PrizeDistributor/useAllValidDrawIds'
import { usePrizeDistributors } from './PrizeDistributor/usePrizeDistributors'
import { usePrizeDistributorToken } from './PrizeDistributor/usePrizeDistributorToken'
import { useValidDrawIds } from './PrizeDistributor/useValidDrawIds'

const getQueryKey = (prizeDistributor: PrizeDistributor, drawId: number, dedupe: boolean) => [
  'useDrawWinners',
  drawId,
  prizeDistributor.id(),
  dedupe ? 'dedupe' : 'no-dedupe'
]

export const useAllLatestDrawWinners = (dedupe: boolean = false) => {
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
  return useAllDrawWinners(data, dedupe)
}

export const useAllDrawWinners = (
  data: { prizeDistributor: PrizeDistributor; drawId: number }[],
  dedupe: boolean = false
) => {
  const queryResults = useAllPrizeDistributorTokens()
  const queries = useMemo(
    () =>
      data.map(({ prizeDistributor, drawId }) => {
        const tokenQuery = queryResults.find(
          (qr) => qr.data?.prizeDistributorId === prizeDistributor.id()
        )
        return {
          queryKey: getQueryKey(prizeDistributor, drawId, dedupe),
          queryFn: () =>
            getDrawWinners(prizeDistributor, drawId, tokenQuery?.data?.token.decimals, dedupe),
          enabled: !!prizeDistributor && !!drawId && !!tokenQuery?.data?.token.decimals
        }
      }),
    [data, dedupe, queryResults]
  )
  return useQueries(queries)
}

export const useLatestDrawWinners = (
  prizeDistributor: PrizeDistributor,
  dedupe: boolean = false
) => {
  const { data } = useValidDrawIds(prizeDistributor)
  return useDrawWinners(prizeDistributor, data?.drawIds[data?.drawIds.length - 1], dedupe)
}

export const useDrawWinners = (
  prizeDistributor: PrizeDistributor,
  drawId: number,
  dedupe: boolean = false
) => {
  const { data } = usePrizeDistributorToken(prizeDistributor)
  return useQuery(
    getQueryKey(prizeDistributor, drawId, dedupe),
    () => getDrawWinners(prizeDistributor, drawId, data?.token.decimals, dedupe),
    {
      enabled: !!prizeDistributor && !!drawId
    }
  )
}

// TODO: THIS NEEDS DECIMALS TO FORMAT THE AMOUNT CORRECTLY
const getDrawWinners = async (
  prizeDistributor: PrizeDistributor,
  _drawId: number,
  decimals: string,
  dedupe: boolean = false
) => {
  let drawId = _drawId
  const fetchData = (drawId: number) =>
    fetch(PrizeApi.getAllPrizesUrl(prizeDistributor.chainId, prizeDistributor.address, drawId))
  let response = await fetchData(drawId)

  let data: {
    address: string
    amount: string
    pick: string
    tier: number
  }[]

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

  let prizes = data.map((prize) => formatPrize(prize, decimals)).sort((a, b) => a.tier - b.tier)
  if (dedupe) {
    prizes = prizes.filter(
      (prize, index) =>
        prizes.find((p) => p.address === prize.address && p.tier === prize.tier) === prize
    )
  }

  return {
    chainId: prizeDistributor.chainId,
    prizes,
    prizeDistributorId: prizeDistributor.id(),
    drawId
  }
}

const formatPrize = (
  prize: { address: string; amount: string; pick: string; tier: number },
  decimals: string
) => ({
  ...prize,
  amount: getAmountFromBigNumber(BigNumber.from(prize.amount), decimals)
})
