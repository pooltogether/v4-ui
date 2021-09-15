import { ContractList } from '@pooltogether/v4-js-client'
import { testnets } from '@pooltogether/v4-pool-data'

export const useContractList = (): ContractList => {
  return testnets as ContractList
}
