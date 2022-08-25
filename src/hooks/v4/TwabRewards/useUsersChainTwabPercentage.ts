import { formatUnits } from '@ethersproject/units'
import { useChainPrizePoolTicketTotalSupply } from '@hooks/v4/PrizePool/useChainPrizePoolTicketTotalSupply'
import { useUsersTotalTwab } from '@hooks/v4/PrizePool/useUsersTotalTwab'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'

/**
 * Fetch a user's current percentage of the chain based on their TWAB
 * @returns
 */
export const useUsersChainTwabPercentage = (chainId: number, usersAddress: string) => {
  const { prizePoolTotalSupply: totalTwabSupply, decimals } =
    useChainPrizePoolTicketTotalSupply(chainId)

  const { data: usersTwabs, isFetched: isTwabsFetched } = useUsersTotalTwab(usersAddress)

  return useQuery(
    getUsersChainTwabPercentageKey(chainId, usersAddress),
    () =>
      getUsersChainTwabPercentage(
        chainId,
        totalTwabSupply?.amountUnformatted,
        usersTwabs,
        Number(decimals)
      ),
    {
      enabled: isTwabsFetched && Boolean(totalTwabSupply) && Boolean(decimals)
    }
  )
}

const getTwabForChain = (chainId, usersTwabs) => {
  return usersTwabs.twabDataPerChain.find((twab) => twab.chainId === chainId).twab.amountUnformatted
}

const getUsersChainTwabPercentageKey = (chainId: number, usersAddress: string) => [
  'getUsersChainTwabPercentage',
  chainId,
  usersAddress
]

export const getUsersChainTwabPercentage = async (
  chainId: number,
  totalTwabSupply: BigNumber,
  usersTwabs: any,
  decimals: number
) => {
  const usersChainTwabAmountUnformatted = getTwabForChain(chainId, usersTwabs)

  const users = formatUnits(usersChainTwabAmountUnformatted, decimals)
  const total = formatUnits(totalTwabSupply, decimals)

  return parseFloat(users) / parseFloat(total)
}
