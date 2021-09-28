import { useAppEnv } from '@pooltogether/hooks'
import { DRAW_PRIZES } from 'lib/constants/drawPrize'

export const useEnvDrawPrizeAddresses = () => {
  const { appEnv } = useAppEnv()
  return DRAW_PRIZES[appEnv]
}
