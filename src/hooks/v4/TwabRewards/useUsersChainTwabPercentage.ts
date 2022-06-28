import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'
import { formatUnits } from '@ethersproject/units'

import { useUsersTotalTwab } from '@hooks/v4/PrizePool/useUsersTotalTwab'
import { usePrizePoolByChainId } from '@hooks/v4/PrizePool/usePrizePoolByChainId'
import { usePrizePoolTicketTotalSupply } from '@hooks/v4/PrizePool/usePrizePoolTicketTotalSupply'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'

/**
 * Fetch a user's current percentage of the chain based on their TWAB
 * @returns
 */
export const useUsersChainTwabPercentage = (chainId: number, usersAddress: string) => {
  const { prizePoolTotalSupply: totalTwabSupply, decimals } =
    useChainIdPrizePoolTicketTotalSupply(chainId)

  const { data: usersTwabs, isFetched: isTwabsFetched } = useUsersTotalTwab(usersAddress)

  return useQuery(
    getUsersChainTwabPercentageKey(chainId, usersAddress),
    () => getUsersChainTwabPercentage(chainId, totalTwabSupply, usersTwabs, decimals),
    {
      enabled: isTwabsFetched && Boolean(totalTwabSupply) && Boolean(decimals)
    }
  )
}

const useChainIdPrizePoolTicketTotalSupply = (chainId) => {
  const prizePool = usePrizePoolByChainId(chainId)

  const { data: tokens } = usePrizePoolTokens(prizePool)

  const { data: prizePoolTotalSupply } = usePrizePoolTicketTotalSupply(prizePool)

  return { prizePoolTotalSupply, decimals: tokens?.ticket.decimals }
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
  decimals: string
) => {
  const usersChainTwabAmountUnformatted = getTwabForChain(chainId, usersTwabs)

  const users = formatUnits(usersChainTwabAmountUnformatted, Number(decimals))
  const total = formatUnits(totalTwabSupply, Number(decimals))

  return parseFloat(users) / parseFloat(total)
}
