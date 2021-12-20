import { batch, contract } from '@pooltogether/etherplex'
import { Amount, useReadProviders } from '.yalc/@pooltogether/hooks/dist'
import { useQueries } from 'react-query'
import { Provider } from '@ethersproject/abstract-provider'
import { BigNumber } from 'ethers'
import { amountMultByUsd, toScaledUsdBigNumber } from '@pooltogether/utilities'

import { useV3ChainIds } from './useV3ChainIds'
import { useV3PrizePools } from './useV3PrizePools'
import ERC20Abi from 'abis/ERC20Abi'
import { NO_REFETCH } from 'lib/constants/query'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'

export interface V3Token {
  prizePool: any
  address: string
  decimals: string
  derivedETH: string
  name: string
  numberOfHolders: string
  symbol: string
  totalSupply: string
  totalSupplyUnformatted: BigNumber
  totalValueUsd: string
  totalValueUsdScaled: BigNumber
  usdPrice: number
  balance: Amount
  balanceUsd: Amount
  balanceValueUsdScaled: BigNumber
}

export const useAllUsersV3Balances = (usersAddress: string) => {
  const chainIds = useV3ChainIds()
  const providers = useReadProviders(chainIds)
  const { data: v3PrizePools, isFetched, error } = useV3PrizePools()

  return useQueries(
    chainIds.map((chainId) => ({
      ...NO_REFETCH,
      queryKey: ['useUsersV3Balances', usersAddress, chainId],
      queryFn: async () =>
        getUsersV3BalancesByChainId(
          usersAddress,
          providers[chainId],
          chainId,
          v3PrizePools?.[chainId]
        ),
      enabled: isFetched && Boolean(usersAddress)
    }))
  )
}

const getUsersV3BalancesByChainId = async (
  usersAddress: string,
  provider: Provider,
  chainId: number,
  prizePools: any[]
) => {
  const batchRequests = []

  prizePools.map((prizePool) => {
    const ticketAddress = prizePool.tokens.ticket.address
    const sponsorshipAddress = prizePool.tokens.sponsorship.address
    const ticketContract = contract(ticketAddress, ERC20Abi, ticketAddress)
    const sponsorshipContract = contract(sponsorshipAddress, ERC20Abi, sponsorshipAddress)
    batchRequests.push(
      ticketContract.balanceOf(usersAddress),
      sponsorshipContract.balanceOf(usersAddress)
    )
  })
  const results = await batch(provider, ...batchRequests)

  const tokens: { [tokenAddress: string]: V3Token } = {}
  Object.keys(results).forEach((tokenAddress) => {
    const balanceUnformatted = results[tokenAddress].balanceOf[0]

    const prizePool = getPrizePool(tokenAddress, prizePools)
    const tokenData = getTokenData(tokenAddress, prizePool)

    const balance = getAmountFromBigNumber(balanceUnformatted, tokenData.decimals)
    const balanceValueUsdUnformatted = amountMultByUsd(balanceUnformatted, tokenData.usd)
    const balanceUsd = getAmountFromBigNumber(balanceValueUsdUnformatted, tokenData.decimals)
    const balanceValueUsdScaled = toScaledUsdBigNumber(balanceUsd.amount)

    tokens[tokenAddress] = {
      prizePool,
      ...tokenData,
      usdPrice: tokenData.usd,
      balance,
      balanceValueUsdScaled,
      balanceUsd
    }
  })

  return {
    chainId,
    tokens
  }
}

const getPrizePool = (tokenAddress: string, prizePools: any[]) => {
  return prizePools.find(
    (prizePool) =>
      prizePool.tokens.ticket.address === tokenAddress ||
      prizePool.tokens.sponsorship.address === tokenAddress
  )
}

const getTokenData = (tokenAddress: string, prizePool: any): any => {
  return Object.values(prizePool.tokens).find((token) => token.address === tokenAddress)
}
