import { useEffect } from 'react'
import { getStoredIsTestnetsCookie, useReadProviders } from '@pooltogether/hooks'
import { getContractListChainIds, PrizePoolNetwork } from '@pooltogether/v4-js-client'
import { testnet, mainnet } from '@pooltogether/v4-pool-data'
import { atom, useAtom } from 'jotai'

import { useContractListChainIds } from 'lib/hooks/Tsunami/useContractListChainIds'
import { useContractList } from '../useContractList'
import { getReadProviders } from '@pooltogether/utilities'

// Initialize Prize Pool Network atom
const isTestnets = getStoredIsTestnetsCookie()
const contractList = isTestnets ? testnet : mainnet
const chainIds = getContractListChainIds(contractList.contracts)
const readProviders = getReadProviders(chainIds)
const prizePoolNetwork = new PrizePoolNetwork(readProviders, contractList)
const prizePoolNetworkAtom = atom(prizePoolNetwork)

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
