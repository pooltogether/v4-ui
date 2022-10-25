import { Contract, ContractType } from '@pooltogether/v4-client-js'

export const getFirstAddressInContractList = (
  contractList: Contract[],
  chainId: number,
  type: ContractType
) => contractList.find((c) => c.type === type && c.chainId === chainId)?.[0].address
