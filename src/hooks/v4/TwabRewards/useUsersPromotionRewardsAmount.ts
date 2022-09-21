import { batch } from '@pooltogether/etherplex'
import { getRefetchInterval } from '@pooltogether/hooks'
import { getReadProvider } from '@pooltogether/wallet-connection'
import {
  getTwabRewardsEtherplexContract,
  getTwabRewardsContractAddress
} from '@utils/v4/TwabRewards/getTwabRewardsContract'
import { useQuery } from 'react-query'

/**
 * Fetch a promotion's data (eg. currentEpochId, etc)
 * @returns
 */
export const useUsersPromotionRewardsAmount = (
  chainId: number,
  promotionId: number,
  maxCompletedEpochId: number,
  usersAddress: string
) => {
  return useQuery(
    getUsersChainPromotionKey(chainId, promotionId, maxCompletedEpochId, usersAddress),
    async () =>
      getUsersPromotionRewardsAmount(chainId, promotionId, maxCompletedEpochId, usersAddress),
    { refetchInterval: getRefetchInterval(chainId) }
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
  maxCompletedEpochId: number,
  usersAddress: string
) => {
  const provider = getReadProvider(chainId)
  const twabRewardsContract = getTwabRewardsEtherplexContract(chainId)
  const twabRewardsContractAddress = getTwabRewardsContractAddress(chainId)

  const epochIds = Array.from(Array(maxCompletedEpochId).keys())

  try {
    const twabRewardsResults = await batch(
      provider,
      // @ts-ignore
      twabRewardsContract.getRewardsAmount(usersAddress, promotionId, epochIds)
    )

    const rewardsAmount: string[] = twabRewardsResults[
      twabRewardsContractAddress
    ].getRewardsAmount[0]
      .toString()
      .split(',')

    const rewardsAndEpochs = rewardsAmount.map((reward, index) => ({
      reward,
      epochId: epochIds[index]
    }))

    return { rewardsAmount, rewardsAndEpochs }
  } catch (e) {
    return {
      rewardsAmount: [] as string[],
      rewardsAndEpochs: [] as { reward: string; epochId: number }[]
    }
  }
}
