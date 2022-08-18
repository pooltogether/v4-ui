import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { selectedChainIdAtom, setSelectedChainIdWriteAtom } from '../atoms'

export const useSelectedChainId = () => {
  const [chainId] = useAtom(selectedChainIdAtom)
  const setSelectedChainId = useUpdateAtom(setSelectedChainIdWriteAtom)
  return { chainId, setSelectedChainId }
}
