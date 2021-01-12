import { atom, useAtom } from 'jotai'
import { fetchAllIdentities } from 'lib/services/social'
import { useEffect } from 'react'

export const socialIdentitiesAtom = atom({})

export const useSybilSocialIdentities = () => {
  const [socialIdentities, setSocialIdentities] = useAtom(socialIdentitiesAtom)

  useEffect(() => {
    const fetchData = async () => {
      const socialIdentities = await fetchAllIdentities()
      const lowerCaseIdentities = {}
      if (socialIdentities) {
        Object.keys(socialIdentities).forEach(
          (address) => (lowerCaseIdentities[address.toLowerCase()] = socialIdentities[address])
        )
        setSocialIdentities(lowerCaseIdentities)
      }
    }
    if (Object.keys(socialIdentities).length === 0) {
      fetchData()
    }
  }, [])
}
