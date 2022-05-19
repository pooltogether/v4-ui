import * as Sentry from '@sentry/react'
import { useSendTransaction as _useSendTransaction } from '@pooltogether/wallet-connection'
import { useTranslation } from 'react-i18next'

/**
 * A simple wrapper on useSendTransaction providing a Sentry logger
 */
export const useSendTransaction = () => {
  const { t } = useTranslation()
  return _useSendTransaction(t, Sentry.captureException)
}
