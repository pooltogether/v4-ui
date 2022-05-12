import { useIsWalletMetamask as _useIsWalletMetamask } from '@pooltogether/hooks'
import { useConnect } from 'wagmi'

export const useIsWalletMetamask = () => {
  const { data } = useConnect()
  return !!(data?.activeConnector?.name === 'MetaMask')
}
