import { Contract, getContractListChainIds } from '.yalc/@pooltogether/v4-js-client/dist'
import { useMemo } from 'react'

// export const useContractListChainIds = (contracts: Contract[]) =>
//   useMemo(() => getContractListChainIds(contracts), [contracts])

export const useContractListChainIds = () => [4]
