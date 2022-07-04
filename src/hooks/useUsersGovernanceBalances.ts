import { MAINNET_POOL_ADDRESS, MAINNET_PPOOL_ADDRESS } from '@constants/misc'
import { useTokenBalances } from '@pooltogether/hooks'
import { CHAIN_ID } from '@pooltogether/wallet-connection'

export const useUsersGovernanceBalances = (usersAddress: string) => {
  return useTokenBalances(CHAIN_ID.mainnet, usersAddress, [
    MAINNET_POOL_ADDRESS,
    MAINNET_PPOOL_ADDRESS
  ])
}
