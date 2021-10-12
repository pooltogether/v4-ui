import { ContractList } from '@pooltogether/v4-js-client'
import { testnet } from '@pooltogether/v4-pool-data'

// TODO: Return the right one depending on the app env
export const useContractList = (): ContractList => {
  return testnet as ContractList
}
