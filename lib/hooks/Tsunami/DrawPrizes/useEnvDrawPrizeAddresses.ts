import { useAppEnv } from '@pooltogether/hooks'
import { DRAW_PRIZES } from '../../../constants/drawPrizes'

export const useEnvDrawPrizeAddresses = () => {
  const { appEnv } = useAppEnv()
  return DRAW_PRIZES[appEnv]
}
