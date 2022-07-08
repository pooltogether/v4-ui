import { useAppEnvString } from '@hooks/useAppEnvString'

import { CHAIN_ID } from '@constants/misc'

const SUPPORTED_CHAIN_IDS = {
  mainnets: [CHAIN_ID.optimism, CHAIN_ID.polygon, CHAIN_ID.mainnet, CHAIN_ID.avalanche],
  testnets: [CHAIN_ID['optimism-kovan'], CHAIN_ID.mumbai, CHAIN_ID.rinkeby, CHAIN_ID.fuji]
}

export const useSupportedTwabRewardsChainIds = () => {
  const appEnv = useAppEnvString()
  return SUPPORTED_CHAIN_IDS[appEnv]
}
