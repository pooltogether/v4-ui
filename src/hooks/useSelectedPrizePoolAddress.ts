import { PrizePool } from '@pooltogether/v4-client-js'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { selectedPrizePoolAddressAtom, setSelectedPrizePoolWriteAtom } from '../atoms'

export const useSelectedPrizePoolAddress = () => {
  const [prizePoolAddress] = useAtom(selectedPrizePoolAddressAtom)
  const setSelectedPrizePoolAddress = useUpdateAtom(setSelectedPrizePoolWriteAtom)

  return {
    prizePoolAddress,
    setSelectedPrizePoolAddress
  }
}
