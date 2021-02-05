import { useClaimablePoolFromTokenFaucets } from 'lib/hooks/useClaimablePoolFromTokenFaucets'
import { useClaimablePoolFromRetroactiveDistribution } from 'lib/hooks/useClaimablePoolFromRetroactiveDistribution'

export const useTotalClaimablePool = () => {
  const {
    data: claimableFromTokenFaucets,
    isFetched: isClaimableFromTokenFaucetsFetched
  } = useClaimablePoolFromTokenFaucets()

  const {
    data: retroactivePoolClaimData,
    isFetched: isRetroactiveClaimablePoolFetched
  } = useClaimablePoolFromRetroactiveDistribution()

  const isFetched = isClaimableFromTokenFaucetsFetched && isRetroactiveClaimablePoolFetched

  let total
  if (isFetched) {
    total = claimableFromTokenFaucets.total + retroactivePoolClaimData.amount
  }

  return {
    isFetched,
    total
  }
}
