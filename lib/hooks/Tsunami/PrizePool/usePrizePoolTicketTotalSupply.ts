import { useRefetchInterval } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-js-client'
import { useQuery } from 'react-query'

export const usePrizePoolTicketTotalSupply = (prizePool: PrizePool) => {
  const refetchInterval = useRefetchInterval(prizePool?.chainId)
  console.log({ refetchInterval })
  const enabled = Boolean(prizePool)
  return useQuery(
    ['usePrizePoolTicketTotalSupply', prizePool?.id()],
    () => prizePool?.getTicketTotalSupply(),
    {
      enabled,
      refetchInterval
    }
  )
}
