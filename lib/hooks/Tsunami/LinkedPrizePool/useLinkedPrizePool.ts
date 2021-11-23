import { useEffect } from 'react'
import { useReadProviders } from '@pooltogether/hooks'
import { LinkedPrizePool } from '@pooltogether/v4-js-client'
import { atom, useAtom } from 'jotai'

import { useContractListChainIds } from 'lib/hooks/Tsunami/useContractListChainIds'
import { useContractList } from '../useContractList'

const linkedPrizePoolAtom = atom(undefined as LinkedPrizePool)

export const useLinkedPrizePool = (): LinkedPrizePool => {
  const [linkedPrizePool, setLinkedPrizePool] = useAtom(linkedPrizePoolAtom)
  const linkedPrizePoolContractList = useContractList()
  const chainIds = useContractListChainIds(linkedPrizePoolContractList.contracts)
  const readProviders = useReadProviders(chainIds)

  useEffect(() => {
    if (!readProviders || !linkedPrizePoolContractList) return
    const providerChainIds = Object.keys(readProviders)
    if (Boolean(linkedPrizePool)) {
      const prizePoolChainIds = linkedPrizePool.prizePools.map((p) => p.chainId)
      if (prizePoolChainIds.every((chainId) => providerChainIds.includes(String(chainId)))) return
      const newLinkedPrizePool = new LinkedPrizePool(readProviders, linkedPrizePoolContractList)
      setLinkedPrizePool(newLinkedPrizePool)
    } else {
      const newLinkedPrizePool = new LinkedPrizePool(readProviders, linkedPrizePoolContractList)
      setLinkedPrizePool(newLinkedPrizePool)
    }
  }, [readProviders])

  return linkedPrizePool
}
