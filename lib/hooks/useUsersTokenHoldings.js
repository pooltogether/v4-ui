import { useUsersAddress } from '@pooltogether/hooks'
import { usePrizePoolTokens } from 'lib/hooks/usePrizePoolTokens'

export const useUsersTokenHoldings = () => {
  const usersAddress = useUsersAddress()
  return usePrizePoolTokens(usersAddress)
}
