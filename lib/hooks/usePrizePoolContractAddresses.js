import { QUERY_KEYS } from 'lib/constants'
import { usePrizePoolAddresses } from 'lib/hooks/usePrizePoolAddresses'
import { useReadProvider } from 'lib/hooks/useReadProvider'
import { useQuery } from 'react-query'
import PrizePoolAbi from '@pooltogether/pooltogether-contracts/abis/PrizePool'
import PrizeStrategyAbi from '@pooltogether/pooltogether-contracts/abis/PeriodicPrizeStrategy'
import { batch, contract } from '@pooltogether/etherplex'

// TODO: Move this to usePrizePools when tokenLisener bug gets fixed and the graph gets updated to v3.2.0
export const usePrizePoolContractAddresses = () => {
  const { readProvider, isLoaded: isReadProviderLoaded } = useReadProvider()
  const prizePoolAddresses = usePrizePoolAddresses()

  return useQuery(
    [QUERY_KEYS.prizePoolContractAddresses, prizePoolAddresses],
    async () => {
      return getPrizePoolContractAddresses(readProvider, prizePoolAddresses)
    },
    {
      enabled: isReadProviderLoaded,
      refetchInterval: false,
      refetchOnWindowFocus: false
    }
  )
}

const getPrizePoolContractAddresses = async (provider, prizePoolAddresses) => {
  try {
    const pools = {}
    prizePoolAddresses.forEach(
      (prizePoolAddress) => (pools[prizePoolAddress] = { prizePool: prizePoolAddress })
    )

    let batchCalls = []
    prizePoolAddresses.forEach((prizePoolAddress) => {
      const prizePoolContract = contract(prizePoolAddress, PrizePoolAbi, prizePoolAddress)
      batchCalls.push(prizePoolContract.prizeStrategy())
    })
    const prizeStrategyResults = await batch(provider, ...batchCalls)

    const prizeStrategyAddresses = []
    prizePoolAddresses.forEach((prizePoolAddress) => {
      const prizeStrategyAddress = prizeStrategyResults[prizePoolAddress].prizeStrategy[0]
      pools[prizePoolAddress].prizeStrategy = prizeStrategyAddress
      prizeStrategyAddresses.push(prizeStrategyAddress)
    })

    batchCalls = []
    prizePoolAddresses.forEach((prizePoolAddress) => {
      const prizeStrategyAddress = pools[prizePoolAddress].prizeStrategy

      const prizeStrategyContract = contract(
        prizeStrategyAddress,
        PrizeStrategyAbi,
        prizeStrategyAddress
      )
      batchCalls.push(prizeStrategyContract.tokenListener())
    })
    const tokenListenerResults = await batch(provider, ...batchCalls)

    const tokenFaucets = []
    prizePoolAddresses.forEach((prizePoolAddress) => {
      const prizeStrategyAddress = pools[prizePoolAddress].prizeStrategy
      const tokenFaucetAddress = tokenListenerResults[prizeStrategyAddress].tokenListener[0]
      tokenFaucets.push(tokenFaucetAddress)
      pools[prizePoolAddress].tokenFaucet = tokenFaucetAddress
    })

    return pools
  } catch (e) {
    console.error(e.message)
    return {}
  }
}
