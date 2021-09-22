import { useEnvClaimableDrawAddresses } from 'lib/hooks/Tsunami/ClaimableDraws/useEnvClaimableDrawAddresses'
import { useClaimableDraw } from 'lib/hooks/Tsunami/ClaimableDraws/useClaimableDraw'
import { useClaimableDraws } from 'lib/hooks/Tsunami/ClaimableDraws/useClaimableDraws'
import { useMemo } from 'react'

export const useNetworkClaimableDraws = (chainId: number) => {
  const { data, ...useQueryResults } = useClaimableDraws()
  const filteredClaimableDraws = useMemo(
    () => data?.filter((claimableDraw) => claimableDraw.chainId === chainId),
    [data, chainId]
  )

  return {
    data: filteredClaimableDraws,
    ...useQueryResults
  }
}
