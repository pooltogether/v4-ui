import { useClaimableDraws } from 'lib/hooks/Tsunami/ClaimableDraws/useClaimableDraws'
import { useMemo } from 'react'

export const useClaimableDraw = (chainId: number, address: string) => {
  const { data: claimableDraws } = useClaimableDraws()
  return useMemo(() => {
    if (!claimableDraws) return null
    const claimableDraw = claimableDraws.find(
      (claimableDraw) => claimableDraw.chainId === chainId && claimableDraw.address === address
    )
    if (!claimableDraw) return null
    console.log('claimableDraw', claimableDraw)
    return claimableDraw
  }, [claimableDraws])
}
