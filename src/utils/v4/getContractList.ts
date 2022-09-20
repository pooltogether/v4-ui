import { getStoredIsTestnetsCookie, useIsTestnets } from '@pooltogether/hooks'
import { ContractList } from '@pooltogether/v4-client-js'
import { testnet, mainnet } from '@pooltogether/v4-pool-data'

export const getContractList = (): ContractList => {
  const isTestnets = getStoredIsTestnetsCookie()
  return isTestnets ? (testnet as ContractList) : (mainnet as ContractList)
}
