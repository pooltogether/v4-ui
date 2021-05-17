import { CONTRACT_ADDRESSES, QUERY_KEYS } from 'lib/constants'
import { useQuery } from 'react-query'
import ERC20Abi from 'abis/ERC20Abi'
import { batch, contract } from '@pooltogether/etherplex'
import { useContext } from 'react'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { useReadProvider } from 'lib/hooks/useReadProvider'
import { NETWORK } from '@pooltogether/utilities'

export const usePoolPoolBalance = (usersAddress) => {
  const { chainId, pauseQueries } = useContext(AuthControllerContext)
  const { readProvider, isLoaded: readProviderIsLoaded } = useReadProvider()

  const enabled = !pauseQueries && readProviderIsLoaded && chainId === NETWORK.mainnet
  return useQuery(
    [QUERY_KEYS.poolPoolBalance, usersAddress, chainId],
    () => getPoolPoolBalance(chainId, readProvider, usersAddress),
    { enabled }
  )
}

const getPoolPoolBalance = async (chainId, readProvider, usersAddress) => {
  try {
    const ticketContract = contract('ticket', ERC20Abi, CONTRACT_ADDRESSES[chainId].PoolPoolTicket)
    const ticketChainData = await batch(readProvider, ticketContract.balanceOf(usersAddress))
    console.log(ticketChainData)
    return ticketChainData.ticket.balanceOf[0]
  } catch (e) {
    return null
  }
}
