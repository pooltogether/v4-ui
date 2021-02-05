import { QUERY_KEYS } from 'lib/constants'
import { usePrizePoolAddresses } from 'lib/hooks/usePrizePoolAddresses'
import { useReadProvider } from 'lib/hooks/useReadProvider'
import { useQuery } from 'react-query'
import PrizePoolAbi from '@pooltogether/pooltogether-contracts/abis/PrizePool'
import PrizeStrategyAbi from '@pooltogether/pooltogether-contracts/abis/PeriodicPrizeStrategy'
import { batch, contract } from '@pooltogether/etherplex'

export const useTokenFaucetAddresses = () => {
  const { readProvider, isLoaded: isReadProviderLoaded } = useReadProvider()
  const prizePoolAddresses = usePrizePoolAddresses()

  return useQuery(
    [QUERY_KEYS.tokenFaucetAddresses, prizePoolAddresses],
    async () => {
      return getTokenFaucetAddresses(readProvider, prizePoolAddresses)
    },
    {
      enabled: isReadProviderLoaded
    }
  )
}

const getTokenFaucetAddresses = async (provider, prizePoolAddresses) => {
  try {
    let batchCalls = []
    prizePoolAddresses.forEach((prizePoolAddress) => {
      const prizePoolContract = contract(prizePoolAddress, PrizePoolAbi, prizePoolAddress)
      batchCalls.push(prizePoolContract.prizeStrategy())
    })
    const prizeStrategyResults = await batch(provider, ...batchCalls)

    const prizeStrategyAddresses = []
    prizePoolAddresses.forEach((prizePoolAddress) => {
      prizeStrategyAddresses.push(prizeStrategyResults[prizePoolAddress].prizeStrategy[0])
    })

    batchCalls = []
    prizeStrategyAddresses.forEach((prizeStrategyAddress) => {
      const prizeStrategyContract = contract(
        prizeStrategyAddress,
        PrizeStrategyAbi,
        prizeStrategyAddress
      )
      batchCalls.push(prizeStrategyContract.tokenListener())
    })
    const tokenListenerResults = await batch(provider, ...batchCalls)

    const tokenFaucets = []
    prizeStrategyAddresses.forEach((prizeStrategyAddress) => {
      tokenFaucets.push(tokenListenerResults[prizeStrategyAddress].tokenListener[0])
    })

    return tokenFaucets
  } catch (e) {
    console.error(e.message)
    return []
  }
}
