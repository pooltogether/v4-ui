import { POOL_TOKEN, PPOOL_TICKET_TOKEN } from '@constants/misc'
import { useTokenBalances } from '@pooltogether/hooks'
import { CHAIN_ID } from '@pooltogether/wallet-connection'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { ethers } from 'ethers'
import { useMemo } from 'react'

export const useUsersPoolTokenBalances = (usersAddress: string) => {
  const {
    data: ethereumBalances,
    isFetched: isEthereumBalancesFetched,
    isFetching: isEthereumBalancesFetching
  } = useTokenBalances(CHAIN_ID.mainnet, usersAddress, [
    POOL_TOKEN[CHAIN_ID.mainnet],
    PPOOL_TICKET_TOKEN[CHAIN_ID.mainnet]
  ])
  const {
    data: polygonBalances,
    isFetched: isPolygonBalancesFetched,
    isFetching: isPolygonBalancesFetching
  } = useTokenBalances(CHAIN_ID.polygon, usersAddress, [
    POOL_TOKEN[CHAIN_ID.polygon],
    PPOOL_TICKET_TOKEN[CHAIN_ID.polygon]
  ])
  const {
    data: optimismBalances,
    isFetched: isOptimismBalancesFetched,
    isFetching: isOptimismBalancesFetching
  } = useTokenBalances(CHAIN_ID.optimism, usersAddress, [POOL_TOKEN[CHAIN_ID.optimism]])

  return useMemo(() => {
    let totalUnformatted = ethers.constants.Zero

    if (isEthereumBalancesFetched) {
      totalUnformatted = totalUnformatted
        .add(ethereumBalances[POOL_TOKEN[CHAIN_ID.mainnet]].amountUnformatted)
        .add(ethereumBalances[PPOOL_TICKET_TOKEN[CHAIN_ID.mainnet]].amountUnformatted)
    }
    if (isPolygonBalancesFetched) {
      totalUnformatted = totalUnformatted
        .add(polygonBalances[POOL_TOKEN[CHAIN_ID.polygon]].amountUnformatted)
        .add(polygonBalances[PPOOL_TICKET_TOKEN[CHAIN_ID.polygon]].amountUnformatted)
    }
    if (isOptimismBalancesFetched) {
      totalUnformatted = totalUnformatted.add(
        optimismBalances[POOL_TOKEN[CHAIN_ID.optimism]].amountUnformatted
      )
    }

    const decimals =
      ethereumBalances?.[POOL_TOKEN[CHAIN_ID.mainnet]].decimals ||
      polygonBalances?.[POOL_TOKEN[CHAIN_ID.polygon]].decimals
    const total = getAmountFromBigNumber(totalUnformatted, decimals)
    return {
      data: {
        balances: {
          [CHAIN_ID.mainnet]: ethereumBalances,
          [CHAIN_ID.polygon]: polygonBalances,
          [CHAIN_ID.optimism]: optimismBalances
        },
        total
      },
      isFetched: isEthereumBalancesFetched && isPolygonBalancesFetched && isOptimismBalancesFetched,
      isFetching:
        isEthereumBalancesFetching && isPolygonBalancesFetching && isOptimismBalancesFetching
    }
  }, [isPolygonBalancesFetching, isEthereumBalancesFetching, isOptimismBalancesFetching])
}
