import { useDrawPrizes } from 'lib/hooks/Tsunami/DrawPrizes/useDrawPrizes'
import { useMemo } from 'react'

export const useDrawPrize = (chainId: number, address: string) => {
  const { data: drawPrizes } = useDrawPrizes()
  return useMemo(() => {
    if (!drawPrizes) return null
    const drawPrize = drawPrizes.find(
      (drawPrize) => drawPrize.chainId === chainId && drawPrize.address === address
    )
    if (!drawPrize) return null
    console.log('drawPrize', drawPrize)
    return drawPrize
  }, [drawPrizes])
}
