import { RPC_URLS } from '@constants/config'
import { getContractListChainIds, PrizePoolNetwork } from '@pooltogether/v4-client-js'
import { getReadProviders } from '@pooltogether/wallet-connection'
import { getContractList } from '@utils/v4/getContractList'
import { atom, useAtom } from 'jotai'

/**
 * NOTE: This runs before the initRpcUrls function so we are explicitly passing the RPC URLs here.
 * @returns
 */
const initializePrizePoolNetwork = () => {
  const prizePoolNetworkContractList = getContractList()
  const chainIds = getContractListChainIds(prizePoolNetworkContractList.contracts)
  const readProviders = getReadProviders(chainIds, RPC_URLS)
  return new PrizePoolNetwork(readProviders, prizePoolNetworkContractList)
}

const prizePoolNetworkAtom = atom<PrizePoolNetwork>(initializePrizePoolNetwork())

export const usePrizePoolNetwork = (): PrizePoolNetwork => {
  const [prizePoolNetwork] = useAtom(prizePoolNetworkAtom)
  return prizePoolNetwork
}
