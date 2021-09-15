import { poolToast } from '@pooltogether/react-components'
import { useSendTransaction as _useSendTransaction } from '@pooltogether/hooks'
import { useTranslation } from 'react-i18next'

/**
 * A simple wrapper on useSendTx to provider t & poolToast
 */
export const useSendTransaction = () => {
  const { t } = useTranslation()
  return _useSendTransaction(t, poolToast)
}
