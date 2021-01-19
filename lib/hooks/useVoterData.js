import { AuthControllerContext } from "lib/components/contextProviders/AuthControllerContextProvider"
import { QUERY_KEYS } from "lib/constants"
import { testAddress } from "lib/utils/testAddress"
import { useContext } from "react"
import { useQuery } from "react-query"

export const useVoterData = (address) => {
  const { chainId, pauseQueries } = useContext(AuthControllerContext)
  const addressError = testAddress(address)

  const results =  useQuery(
    [QUERY_KEYS.delegateDataQuery, chainId, address],
    async () => {
      return getVoterData(address, chainId)
    },
    {
      enabled: !pauseQueries && chainId && address && !addressError
    }
  )

  const {
    isFetched,
    isFetching,
    error
  } = results

  if (error) {
    console.error(error)
  }

  return {
    loading:  !isFetched || (isFetching && !isFetched),
    ...results
  }
}

async function getVoterData (address, chainId) {
  
}