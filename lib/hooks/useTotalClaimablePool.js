import { useClaimablePoolFromTokenFaucets } from 'lib/hooks/useClaimablePoolFromTokenFaucets'
import { useClaimablePoolFromRetroactiveDistribution } from 'lib/hooks/useClaimablePoolFromRetroactiveDistribution'

export const useTotalClaimablePool = () => {
  const {
    data: claimableFromTokenFaucets,
    isFetched: claimableFromTokenFaucetIsFetched
  } = useClaimablePoolFromTokenFaucets()

  const {
    data: retroactivePoolClaimData,
    isFetched: retroactivePoolClaimDataIsFetched
  } = useClaimablePoolFromRetroactiveDistribution()

  const isFetched = claimableFromTokenFaucetIsFetched && retroactivePoolClaimDataIsFetched

  let total
  if (isFetched) {
    total = claimableFromTokenFaucets.total + retroactivePoolClaimData.amount
  }

  return {
    isFetched,
    total
  }
}
