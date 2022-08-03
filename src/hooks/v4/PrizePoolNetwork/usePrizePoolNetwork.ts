import { RPC_API_KEYS } from '@constants/config'
import { getContractListChainIds, PrizePoolNetwork } from '@pooltogether/v4-client-js'
import { getReadProvider } from '@pooltogether/wallet-connection'
import { atom, useAtom } from 'jotai'
import { BaseProvider } from '@ethersproject/providers'
import { getContractList } from '@utils/v4/getContractList'

const initializePrizePoolNetwork = () => {
  const prizePoolNetworkContractList = getContractList()
  const chainIds = getContractListChainIds(prizePoolNetworkContractList.contracts)
  const readProviders: { [chainId: number]: BaseProvider } = {}
  chainIds.forEach((chainId) => {
    readProviders[chainId] = getReadProvider(chainId, RPC_API_KEYS)
  })
  return new PrizePoolNetwork(readProviders, prizePoolNetworkContractList)
}

const prizePoolNetworkAtom = atom<PrizePoolNetwork>(initializePrizePoolNetwork())

export const usePrizePoolNetwork = (): PrizePoolNetwork => {
  const [prizePoolNetwork] = useAtom(prizePoolNetworkAtom)
  return prizePoolNetwork
}
