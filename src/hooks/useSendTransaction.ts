import * as Sentry from '@sentry/react'
import { useSendTransaction as _useSendTransaction } from '@pooltogether/wallet-connection'

/**
 * A simple wrapper on useSendTransaction providing a Sentry logger
 */
export const useSendTransaction = () => {
  return _useSendTransaction(Sentry.captureException)
}
