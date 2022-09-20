import { useSendTransaction as _useSendTransaction } from '@pooltogether/wallet-connection'
import * as Sentry from '@sentry/react'
import { useTranslation } from 'next-i18next'

/**
 * A simple wrapper on useSendTransaction providing a Sentry logger
 */
export const useSendTransaction = () => {
  const { t } = useTranslation()
  return _useSendTransaction(t, Sentry.captureException)
}
