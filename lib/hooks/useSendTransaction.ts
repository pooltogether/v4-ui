import { poolToast } from '@pooltogether/react-components'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { useSendTransaction as _useSendTransaction } from '@pooltogether/hooks'
import { useTranslation } from 'react-i18next'

/**
 * A simple wrapper on useSendTx to provider t & poolToast
 */
export const useSendTransaction = () => {
  const { t } = useTranslation()
  const { address: usersAddress, provider, network: chainId } = useOnboard()
  return _useSendTransaction(t, poolToast, usersAddress, provider, chainId)
}
