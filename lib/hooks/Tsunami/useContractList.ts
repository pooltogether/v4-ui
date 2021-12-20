import { ContractList } from '@pooltogether/v4-js-client'
import { testnet, mainnet } from '@pooltogether/v4-pool-data'
import { useIsTestnets } from '@pooltogether/hooks'

console.log({ testnet })

export const useContractList = (): ContractList => {
  const { isTestnets } = useIsTestnets()
  return isTestnets ? (testnet as ContractList) : (mainnet as ContractList)
}
