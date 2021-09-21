import { useAppEnv } from '.yalc/@pooltogether/hooks/dist'
import { CLAIMABLE_DRAWS } from 'lib/constants/claimableDraws'

export const useEnvClaimableDrawAddresses = () => {
  const { appEnv } = useAppEnv()
  return CLAIMABLE_DRAWS[appEnv]
}
