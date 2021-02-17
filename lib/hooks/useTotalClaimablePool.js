import { useClaimablePoolFromTokenFaucets } from 'lib/hooks/useClaimablePoolFromTokenFaucets'
import { useRetroactivePoolClaimData } from 'lib/hooks/useRetroactivePoolClaimData'

export const useTotalClaimablePool = () => {
  const {
    error: claimableFromTokenFaucetsError,
    data: claimableFromTokenFaucets,
    isFetched: claimableFromTokenFaucetIsFetched
  } = useClaimablePoolFromTokenFaucets()

  if (claimableFromTokenFaucetsError) {
    console.error(claimableFromTokenFaucetsError)
  }

  const {
    error: retroPoolClaimError,
    data: retroPoolClaimData,
    isFetched: retroPoolClaimDataIsFetched
  } = useRetroactivePoolClaimData()

  if (retroPoolClaimError) {
    console.error(retroPoolClaimError)
  }

  const isFetched = claimableFromTokenFaucetIsFetched && retroPoolClaimDataIsFetched

  let total
  if (isFetched) {
    total = claimableFromTokenFaucets.total

    if (retroPoolClaimData?.formattedAmount && !retroPoolClaimData.isClaimed) {
      total += retroPoolClaimData.formattedAmount
    }
  }

  return {
    isFetched,
    total
  }
}
