import { useContext, useEffect, useState } from 'react'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'

export function useCurrentBlock () {
  const { provider } = useContext(AuthControllerContext)
  const [currentBlock, setCurrentBlock] = useState()

  useEffect(() => {
    const getBlockNumber = async () => {
      if (provider?.getBlockNumber) {
        const blockNumber = await provider.getBlockNumber()

        const block = await provider.getBlock(blockNumber)
        setCurrentBlock({
          ...block,
          blockNumber
        })
      }
    }
    getBlockNumber()
  }, [provider])

  return currentBlock
}
