import { useQuery } from 'react-query'
import { useRefetchInterval } from '@pooltogether/hooks'

export const useGasCosts = (chainId) => {
  const enabled = Boolean(chainId)
  const refetchInterval = useRefetchInterval(chainId)

  return useQuery(['useGasCosts', chainId], async () => getGasCosts(chainId), {
    refetchInterval,
    enabled
  })
}

const getGasCosts = async (chainId) => {
  const result = await fetch(`https://pooltogether-api.com/gas/${chainId}`)
  const body = await result.json()
  return body.result
}
