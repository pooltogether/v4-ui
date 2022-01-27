import {
  Token,
  TokenWithBalance,
  useCoingeckoTokenPrices,
  useReadProvider
} from '.yalc/@pooltogether/hooks/dist'
import { Provider } from '@ethersproject/abstract-provider'
import { useQuery } from 'react-query'

import TokenFaucetAbi from 'abis/TokenFaucet'
import { batch, contract } from '@pooltogether/etherplex'
import { BigNumber } from 'ethers'
import { NO_REFETCH } from '.yalc/@pooltogether/hooks/dist/constants'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { useTokenFaucetData } from './useTokenFaucetData'
import { V3PrizePool } from './useV3PrizePools'

export const useUsersTokenFaucetRewards = (
  chainId: number,
  usersAddress: string,
  prizePool: V3PrizePool,
  tokenFaucetAddress: string,
  underlyingTokenValueUsd: number
) => {
  const provider = useReadProvider(chainId)

  const { data: tokenFaucetData, isFetched: isTokenFaucetDataFetched } = useTokenFaucetData(
    chainId,
    tokenFaucetAddress,
    prizePool,
    underlyingTokenValueUsd
  )

  const enabled = isTokenFaucetDataFetched && !!underlyingTokenValueUsd

  return useQuery(
    ['useUsersTokenFaucetRewards', chainId, usersAddress, tokenFaucetAddress],
    () => getTokenFaucetRewards(provider, usersAddress, tokenFaucetAddress, tokenFaucetData),
    { ...NO_REFETCH, enabled }
  )
}

const getTokenFaucetRewards = async (
  provider: Provider,
  usersAddress: string,
  tokenFaucetAddress: string,
  tokenFaucetData: {
    vapr: number
    dripToken: Token
    dripTokenValueUsd: number
    measureToken: Token
    measureTokenValueUsd: number
  }
): Promise<TokenWithBalance> => {
  const { dripToken } = tokenFaucetData

  // Fetch asset and claimable amount
  const tokenFaucetContract = contract(tokenFaucetAddress, TokenFaucetAbi, tokenFaucetAddress)
  const tokenFaucetResults = await batch(provider, tokenFaucetContract.claim(usersAddress))

  const claimableAmountUnformatted: BigNumber = tokenFaucetResults[tokenFaucetAddress].claim[0]
  const claimableAmount = getAmountFromBigNumber(claimableAmountUnformatted, dripToken.decimals)

  return {
    ...claimableAmount,
    ...dripToken,
    hasBalance: !claimableAmountUnformatted.isZero()
  }
}
