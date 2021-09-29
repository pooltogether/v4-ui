import { Contract, getContractListChainIds } from '@pooltogether/v4-js-client'
import { useMemo } from 'react'

export const useContractListChainIds = (contracts: Contract[]) =>
  useMemo(() => getContractListChainIds(contracts), [contracts])
