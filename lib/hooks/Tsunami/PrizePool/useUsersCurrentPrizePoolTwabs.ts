import { Amount } from '@pooltogether/hooks'
import { ethers } from 'ethers'
import { Network } from 'lib/constants/network'
import { useTwabByNetwork } from 'lib/hooks/Tsunami/PrizePool/useTwabByNetwork'
import { useTicketDecimals } from 'lib/hooks/Tsunami/PrizePool/useTicketDecimals'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'

export const useUsersCurrentPrizePoolTwabs = () => {
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } = useTicketDecimals()

  // Fetch data for each network
  const {
    data: ethereumTwab,
    isFetched: isEthereumTwabFetched,
    refetch: refetchEthereumTwab
  } = useTwabByNetwork(Network.ethereum)
  const {
    data: polygonTwab,
    isFetched: isPolygonTwabFetched,
    refetch: refetchPolygonTwab
  } = useTwabByNetwork(Network.polygon)

  const total = isTicketDecimalsFetched
    ? getTotalTwab([ethereumTwab, polygonTwab], ticketDecimals)
    : getAmountFromBigNumber(ethers.constants.Zero, ticketDecimals)

  const isPartiallyFetched = isPolygonTwabFetched || isEthereumTwabFetched
  const isFetched = isPolygonTwabFetched && isEthereumTwabFetched
  const refetch = () => {
    refetchEthereumTwab()
    refetchPolygonTwab()
  }

  return {
    data: {
      total,
      [Network.ethereum]: ethereumTwab,
      [Network.polygon]: polygonTwab
    },
    isPartiallyFetched,
    isFetched,
    refetch
  }
}

const getTotalTwab = (twabs: Amount[], decimals: string) => {
  let total = ethers.constants.Zero
  twabs.forEach((twab) => {
    if (!twab || twab.amountUnformatted.isZero()) return
    total = total.add(twab.amountUnformatted)
  })
  return getAmountFromBigNumber(total, decimals)
}
