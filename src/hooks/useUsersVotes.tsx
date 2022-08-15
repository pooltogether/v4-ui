import { RPC_API_KEYS } from '@constants/config'
import { CHAIN_ID, POOL_TOKEN } from '@constants/misc'
import GovernanceTokenAbi from '@abis/GovernanceToken'
import { Contract } from 'ethers'
import { useQuery } from 'react-query'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { getReadProvider } from '@pooltogether/wallet-connection'

export const useUsersVotes = (usersAddress: string) => {
  return useQuery(['usersVotes', usersAddress], () => getUsersVotes(usersAddress), {
    enabled: !!usersAddress
  })
}

const getUsersVotes = async (usersAddress: string) => {
  const poolContract = new Contract(
    POOL_TOKEN[CHAIN_ID.mainnet],
    GovernanceTokenAbi,
    getReadProvider(CHAIN_ID.mainnet, RPC_API_KEYS)
  )
  console.log('poolContract', poolContract, usersAddress)
  const votes = await poolContract.getCurrentVotes(usersAddress)
  console.log('votes', votes, getAmountFromBigNumber(votes, '18'))
  return getAmountFromBigNumber(votes, '18')
}
