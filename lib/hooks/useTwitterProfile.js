import { QUERY_KEYS } from 'lib/constants'
import { fetchTwitterProfileData } from 'lib/services/social'
import { useQuery } from 'react-query'
import { useAtom } from 'jotai'
import { socialIdentitiesAtom } from 'lib/hooks/useSybilSocialIdentities'
import { useEffect, useState } from 'react'

export const useTwitterProfile = (address) => {
  const twitterHandle = useSocialIdentity(address.toLowerCase())?.twitter?.handle ?? ''
  const { refetch, data, isFetching, isFetched, error } = useFetchTwitterProfile(twitterHandle)

  if (error) {
    console.error(error)
  }

  return {
    refetch,
    data,
    isFetching,
    isFetched,
    error
  }
}

export const useSocialIdentity = (address) => {
  const [socialIdentities] = useAtom(socialIdentitiesAtom)
  const [socialIdentity, setSocialIdentity] = useState({})

  useEffect(() => {
    setSocialIdentity(socialIdentities[address] ?? {})
  }, [socialIdentities, address])

  return socialIdentity
}

const useFetchTwitterProfile = (handle) => {
  return useQuery(
    [QUERY_KEYS.twitterProfileQuery, handle],
    async () => {
      const response = await fetchTwitterProfileData(handle)
      return response
    },
    {
      enabled: Boolean(handle),
      refetchInterval: false
    }
  )
}
