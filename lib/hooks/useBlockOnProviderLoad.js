import { useEffect } from 'react'

import { atom, useAtom } from 'jotai'
import { useReadProvider } from 'lib/hooks/useReadProvider'
import { useGovernanceChainId } from 'lib/hooks/useGovernanceChainId'

const currentBlockAtom = atom({})

export const getBlockNumber = async (readProvider, setCurrentBlock) => {
  if (readProvider?.getBlockNumber) {
    const blockNumber = await readProvider.getBlockNumber()

    const block = await readProvider.getBlock(blockNumber)
    setCurrentBlock({
      ...block,
      blockNumber
    })
  }
}

export const useBlockOnProviderLoad = () => {
  const { readProvider } = useReadProvider()
  const chainId = useGovernanceChainId()
  const [currentBlock, setCurrentBlock] = useAtom(currentBlockAtom)

  useEffect(() => {
    getBlockNumber(readProvider, setCurrentBlock)
  }, [readProvider, chainId])

  return currentBlock
}
