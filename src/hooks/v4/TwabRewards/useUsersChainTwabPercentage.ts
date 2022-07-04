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

  // OPTIMIZE: This is causing the components I'm working on to re-render constantly:
  const { data: usersTwabs, isFetched: isTwabsFetched } = useUsersTotalTwab(usersAddress)

  // const isTwabsFetched = true
  // const twab = {
  //   amount: '0.0',
  //   amountPretty: '0.00',
  //   amountUnformatted: {
  //     _hex: '0x00',
  //     _isBigNumber: true
  //   }
  // }
  // const usersTwabs = {
  //   twab: {
  //     amount: '14061.0',
  //     amountPretty: '14,061',
  //     amountUnformatted: { _hex: '0x034619d540', _isBigNumber: true }
  //   },
  //   twabDataPerChain: [
  //     {
  //       chainId: 4,
  //       usersAddress: '0x5E6CC2397EcB33e6041C15360E17c777555A5E63',
  //       twab: {
  //         amount: '1234.0',
  //         amountPretty: '1,234.00',
  //         amountUnformatted: {
  //           _hex: '0x1256174',
  //           _isBigNumber: true
  //         }
  //       }
  //     },
  //     {
  //       chainId: 80001,
  //       usersAddress: '0x5E6CC2397EcB33e6041C15360E17c777555A5E63',
  //       twab
  //     },
  //     { chainId: 43113, usersAddress: '0x5E6CC2397EcB33e6041C15360E17c777555A5E63', twab },
  //     { chainId: 69, usersAddress: '0x5E6CC2397EcB33e6041C15360E17c777555A5E63', twab }
  //   ],
  //   usersAddress: '0x5E6CC2397EcB33e6041C15360E17c777555A5E63'
  // }

  return useQuery(
    getUsersChainTwabPercentageKey(chainId, usersAddress),
    () => getUsersChainTwabPercentage(chainId, totalTwabSupply, usersTwabs, Number(decimals)),
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
  decimals: number
) => {
  const usersChainTwabAmountUnformatted = getTwabForChain(chainId, usersTwabs)

  const users = formatUnits(usersChainTwabAmountUnformatted, decimals)
  const total = formatUnits(totalTwabSupply, decimals)

  return parseFloat(users) / parseFloat(total)
}
