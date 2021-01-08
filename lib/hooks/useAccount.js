import { useAccountQuery } from 'lib/hooks/useAccountQuery'
import { testAddress } from 'lib/utils/testAddress'

export function useAccount(address, blockNumber = -1) {
  const addressError = testAddress(address)

  const {
    refetch: refetchAccountData,
    data: accountData,
    isFetching: accountDataIsFetching,
    isFetched: accountDataIsFetched,
    error: accountDataError,
  } = useAccountQuery(address, blockNumber, addressError)

  if (accountDataError) {
    console.error(accountDataError)
  }

  return {
    refetchAccountData,
    accountData,
    accountDataIsFetching,
    accountDataIsFetched,
    accountDataError,
  }
}
