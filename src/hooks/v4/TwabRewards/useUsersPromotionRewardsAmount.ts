import { batch } from '@pooltogether/etherplex'
import { useQuery } from 'react-query'
import { getReadProvider } from '@pooltogether/wallet-connection'
import { RPC_API_KEYS } from '@constants/config'

import { NO_REFETCH } from '@constants/query'
import {
  getTwabRewardsEtherplexContract,
  getTwabRewardsContractAddress
} from '@utils/TwabRewards/getTwabRewardsContract'

/**
 * Fetch a promotion's data (eg. currentEpochId, etc)
 * @returns
 */
export const useUsersPromotionRewardsAmount = (
  chainId: number,
  promotionId: number,
  currentEpochId: number,
  usersAddress: string
) => {
  return useQuery(
    getUsersChainPromotionKey(chainId, promotionId, currentEpochId, usersAddress),
    async () => getUsersPromotionRewardsAmount(chainId, promotionId, currentEpochId, usersAddress),
    {
      ...NO_REFETCH,
      enabled: Boolean(currentEpochId)
    }
  )
}

const getUsersChainPromotionKey = (
  chainId: number,
  promotionId: number,
  currentEpochId: number,
  usersAddress: string
) => ['getUsersChainPromotionRewardsAmount', chainId, promotionId, currentEpochId, usersAddress]

export const getUsersPromotionRewardsAmount = async (
  chainId: number,
  promotionId: number,
  currentEpochId: number,
  usersAddress: string
) => {
  console.log('in cuz')
  console.log(currentEpochId)

  const provider = getReadProvider(chainId, RPC_API_KEYS)
  const twabRewardsContract = getTwabRewardsEtherplexContract(chainId)
  const twabRewardsContractAddress = getTwabRewardsContractAddress(chainId)

  const arry = [...Array(currentEpochId + 1).keys()]
  console.log(arry)
  console.log(usersAddress, promotionId, arry)

  const twabRewardsResults = await batch(
    provider,
    twabRewardsContract.getRewardsAmount(usersAddress, promotionId, arry)
  )

  const rewardsAmount =
    twabRewardsResults[twabRewardsContractAddress].getRewardsAmount[0].toString()

  return { rewardsAmount }
}
