import { useEffect } from 'react'
import { useReadProviders } from '@pooltogether/hooks'
import { PrizePoolNetwork } from '@pooltogether/v4-js-client'
import { atom, useAtom } from 'jotai'

import { useContractListChainIds } from 'lib/hooks/Tsunami/useContractListChainIds'
import { useContractList } from '../useContractList'

const prizePoolNetworkAtom = atom(undefined as PrizePoolNetwork)

export const usePrizePoolNetwork = (): PrizePoolNetwork => {
  const [prizePoolNetwork, setPrizePoolNetwork] = useAtom(prizePoolNetworkAtom)
  const prizePoolNetworkContractList = useContractList()
  const chainIds = useContractListChainIds(prizePoolNetworkContractList.contracts)
  const readProviders = useReadProviders(chainIds)

  useEffect(() => {
    if (!readProviders || !prizePoolNetworkContractList) return
    const providerChainIds = Object.keys(readProviders)
    if (Boolean(prizePoolNetwork)) {
      const prizePoolChainIds = prizePoolNetwork.prizePools.map((p) => p.chainId)
      if (prizePoolChainIds.every((chainId) => providerChainIds.includes(String(chainId)))) return
      const newPrizePoolNetwork = new PrizePoolNetwork(readProviders, prizePoolNetworkContractList)
      setPrizePoolNetwork(newPrizePoolNetwork)
    } else {
      const newPrizePoolNetwork = new PrizePoolNetwork(readProviders, prizePoolNetworkContractList)
      setPrizePoolNetwork(newPrizePoolNetwork)
    }
  }, [readProviders])

  return prizePoolNetwork
}
