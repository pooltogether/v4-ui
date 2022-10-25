import { POOL_TOKEN, PPOOL_TICKET_TOKEN } from '@constants/misc'
import { useTokenBalances } from '@pooltogether/hooks'
import { CHAIN_ID } from '@pooltogether/wallet-connection'

/**
 * TODO: Add in all of the other various types of POOL (other chains. other POOL pools. Staked POOL.)
 * @param usersAddress
 * @returns
 */
export const useUsersGovernanceBalances = (usersAddress: string) => {
  return useTokenBalances(CHAIN_ID.mainnet, usersAddress, [
    POOL_TOKEN[CHAIN_ID.mainnet],
    PPOOL_TICKET_TOKEN[CHAIN_ID.mainnet]
  ])
}
