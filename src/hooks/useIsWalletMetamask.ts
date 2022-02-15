import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { useIsWalletMetamask as _useIsWalletMetamask } from '@pooltogether/hooks'

export const useIsWalletMetamask = () => {
  const { wallet } = useOnboard()
  return _useIsWalletMetamask(wallet)
}
