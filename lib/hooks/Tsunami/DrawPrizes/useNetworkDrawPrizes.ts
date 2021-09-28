import { useDrawPrizes } from 'lib/hooks/Tsunami/DrawPrizes/useDrawPrizes'
import { useMemo } from 'react'

export const useNetworkDrawPrizes = (chainId: number) => {
  const { data, ...useQueryResults } = useDrawPrizes()
  const filteredDrawPrizes = useMemo(
    () => data?.filter((drawPrize) => drawPrize.chainId === chainId),
    [data, chainId]
  )

  return {
    data: filteredDrawPrizes,
    ...useQueryResults
  }
}
