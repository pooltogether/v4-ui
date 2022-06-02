import { useAppEnvString } from '@hooks/useAppEnvString'

import { CHAIN_ID } from '@constants/misc'

const SUPPORTED_CHAIN_IDS = {
  mainnets: [CHAIN_ID.avalanche, CHAIN_ID.mainnet, CHAIN_ID.polygon],
  testnets: [CHAIN_ID.rinkeby, CHAIN_ID.mumbai, CHAIN_ID.fuji]
}

export const useSupportedTwabRewardsChainIds = () => {
  const appEnv = useAppEnvString()
  return SUPPORTED_CHAIN_IDS[appEnv]
}
