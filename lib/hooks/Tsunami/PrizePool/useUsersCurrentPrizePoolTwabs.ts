import { Amount } from '@pooltogether/hooks'
import { ethers } from 'ethers'
import { Network } from 'lib/constants/config'
import { useUsersTwabByNetwork } from 'lib/hooks/Tsunami/PrizePool/useUsersTwabByNetwork'
import { useTicketDecimals } from 'lib/hooks/Tsunami/PrizePool/useTicketDecimals'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'

export const useUsersCurrentPrizePoolTwabs = (
  usersAddress: string
): {
  data: {
    [usersAddress: string]: {
      total: Amount
      ethereum: Amount
      polygon: Amount
    }
  }
  isPartiallyFetched: boolean
  isFetched: boolean
  refetch: () => void
} => {
  const { data: ticketDecimals, isFetched: isTicketDecimalsFetched } = useTicketDecimals()

  // Fetch data for each network
  const {
    data: ethereumTwabData,
    isFetched: isEthereumTwabFetched,
    refetch: refetchEthereumTwab
  } = useUsersTwabByNetwork(usersAddress, Network.ethereum)
  const {
    data: polygonTwabData,
    isFetched: isPolygonTwabFetched,
    refetch: refetchPolygonTwab
  } = useUsersTwabByNetwork(usersAddress, Network.polygon)

  const ethereumTwab = isEthereumTwabFetched ? ethereumTwabData[usersAddress] : undefined
  const polygonTwab = isPolygonTwabFetched ? polygonTwabData[usersAddress] : undefined

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
      [usersAddress]: {
        total,
        [Network.ethereum]: ethereumTwab,
        [Network.polygon]: polygonTwab
      }
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
