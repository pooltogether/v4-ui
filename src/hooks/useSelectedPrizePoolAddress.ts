import { useAtom, useSetAtom } from 'jotai'
import { selectedPrizePoolAddressAtom, setSelectedPrizePoolWriteAtom } from '../atoms'

export const useSelectedPrizePoolAddress = () => {
  const [prizePoolAddress] = useAtom(selectedPrizePoolAddressAtom)
  const setSelectedPrizePoolAddress = useSetAtom(setSelectedPrizePoolWriteAtom)

  return {
    prizePoolAddress,
    setSelectedPrizePoolAddress
  }
}
