import { useAllUsersPodTickets } from 'lib/hooks/v3/useAllUsersPodTickets'

export const useUsersPodTickets = (readProviders, usersAddress) => {
  const {
    data: podTicketsByChainId,
    isFetched,
    ...remainder
  } = useAllUsersPodTickets(readProviders, usersAddress)

  if (!isFetched || !podTicketsByChainId) {
    return {
      ...remainder,
      data: podTicketsByChainId,
      isFetched
    }
  }

  const flattenedAndFilteredPodTickets: any[] = []
  const chainIds = Object.keys(podTicketsByChainId)
  chainIds.map((chainId) => {
    const podTickets = podTicketsByChainId[chainId]
    const filteredTickets = podTickets.filter((podTicket) => !podTicket.amountUnformatted.isZero())
    flattenedAndFilteredPodTickets.push(...filteredTickets)
  })

  return {
    ...remainder,
    data: flattenedAndFilteredPodTickets,
    isFetched
  }
}
