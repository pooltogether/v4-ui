import React from 'react'
import { useSybilSocialIdentities } from 'lib/hooks/useSybilSocialIdentities'

export const SocialDataFetcher = (props) => {
  useSybilSocialIdentities()
  return null
}
