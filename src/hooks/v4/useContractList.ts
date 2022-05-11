import contracts from '@pooltogether/v5/contracts.json'
import { ContractList } from '@pooltogether/v4-client-js'
// import { testnet, mainnet } from '@pooltogether/v4-pool-data'
import { useIsTestnets } from '@pooltogether/hooks'
console.log({ contracts })

export const useContractList = (): ContractList => {
  return contracts
  // const { isTestnets } = useIsTestnets()
  // return isTestnets ? (testnet as ContractList) : (mainnet as ContractList)
}
