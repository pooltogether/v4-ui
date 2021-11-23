import { Amount, useRefetchInterval } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-js-client'
import { formatUnits } from '@ethersproject/units'
import { msToS, numberWithCommas } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'
import { useQuery } from 'react-query'

import { useTicketDecimals } from 'lib/hooks/Tsunami/PrizePool/useTicketDecimals'

export const useUsersCurrentPrizePoolTwab = (usersAddress: string, prizePool: PrizePool) => {
  const refetchInterval = useRefetchInterval(prizePool?.chainId)
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } = useTicketDecimals()

  const enabled = Boolean(prizePool) && Boolean(usersAddress) && isTicketDecimalsFetched

  return useQuery(
    ['getUsersCurrentTwab', prizePool?.id(), usersAddress],
    async () => getUsersPrizePoolTwab(prizePool, usersAddress, ticketDecimals),
    {
      refetchInterval,
      enabled
    }
  )
}

const prettyNumber = (amount: BigNumber, decimals: string): string =>
  numberWithCommas(amount, { decimals }) as string

const getUsersPrizePoolTwab = async (
  prizePool: PrizePool,
  usersAddress: string,
  decimals: string
): Promise<{ [usersAddress: string]: Amount }> => {
  const timestamp = Math.round(msToS(Date.now()))
  const twab = await prizePool.getUsersTicketTwabAt(usersAddress, timestamp)

  const amountUnformatted = twab
  const amount = formatUnits(amountUnformatted, decimals)
  const amountPretty = prettyNumber(amountUnformatted, decimals)

  return {
    [usersAddress]: {
      amount,
      amountUnformatted,
      amountPretty
    }
  }
}
