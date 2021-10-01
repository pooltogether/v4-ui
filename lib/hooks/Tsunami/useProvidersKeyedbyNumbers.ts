import { useReadProviders } from '@pooltogether/hooks'
import { useMemo } from 'react'

export const useProvidersKeyedByNumbers = (chainIds: number[]) => {
  const { readProviders, isReadProvidersReady } = useReadProviders(chainIds)
  return useMemo(() => {
    if (!isReadProvidersReady) return null
    const keys = Object.keys(readProviders)
    const providers = {}
    keys.forEach((key) => {
      providers[Number(key)] = readProviders[key]
    })
    // console.log('providers', providers)
    return providers
  }, [isReadProvidersReady, chainIds])
}
