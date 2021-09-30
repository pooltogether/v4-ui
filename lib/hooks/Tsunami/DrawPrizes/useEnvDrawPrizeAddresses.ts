import { DRAW_PRIZES } from '../../../constants/drawPrizes'
import { useAppEnvString } from 'lib/hooks/useAppEnvString'

export const useEnvDrawPrizeAddresses = () => {
  const appEnv = useAppEnvString()

  return DRAW_PRIZES[appEnv]
}
