import { ContractList } from '@pooltogether/v4-client-js'
import { testnet, mainnet } from '@pooltogether/v4-pool-data'
import { getStoredIsTestnetsCookie, useIsTestnets } from '@pooltogether/hooks'

console.log('contract lists', { testnet, mainnet })

export const getContractList = (): ContractList => {
  const isTestnets = getStoredIsTestnetsCookie()
  return isTestnets ? (testnet as ContractList) : (mainnet as ContractList)
}
