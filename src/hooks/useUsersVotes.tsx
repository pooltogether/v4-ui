import GovernanceTokenAbi from '@abis/GovernanceToken'
import { POOL_TOKEN } from '@constants/misc'
import { CHAIN_ID, getReadProvider } from '@pooltogether/wallet-connection'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { Contract } from 'ethers'
import { useQuery } from 'react-query'

export const useUsersVotes = (usersAddress: string) => {
  return useQuery(['usersVotes', usersAddress], () => getUsersVotes(usersAddress), {
    enabled: !!usersAddress
  })
}

const getUsersVotes = async (usersAddress: string) => {
  const poolContract = new Contract(
    POOL_TOKEN[CHAIN_ID.mainnet],
    GovernanceTokenAbi,
    getReadProvider(CHAIN_ID.mainnet)
  )
  const votes = await poolContract.getCurrentVotes(usersAddress)
  return getAmountFromBigNumber(votes, '18')
}
