import { useState } from 'react'
import { useAtom } from 'jotai'
import { transactionsAtom } from '@pooltogether/react-components'

const debug = require('debug')('pool-app:TxRefetchListener')

export function TxRefetchListener(props) {
  const [transactions] = useAtom(transactionsAtom)

  const [storedPendingTransactions, setStoredPendingTransactions] = useState([])

  const pendingTransactions = transactions.filter((t) => !t.completed && !t.cancelled)

  const runRefetch = (tx) => {
    // we don't know when the Graph will have processed the new block data or when it has
    // so simply query a few times for the updated data
    if (tx?.refetch) {
      tx.refetch()
      setTimeout(() => {
        tx.refetch()
        debug('refetch!')
      }, 2000)

      setTimeout(() => {
        tx.refetch()
        debug('refetch!')
      }, 8000)
    }
  }

  storedPendingTransactions.forEach((tx) => {
    const storedTxId = tx.id
    const currentTxState = transactions.find((_tx) => _tx.id === storedTxId)

    if (
      currentTxState &&
      currentTxState.completed &&
      !currentTxState.error &&
      !currentTxState.cancelled
    ) {
      tx?.onSuccess?.()

      runRefetch(tx)
    } else if (
      currentTxState &&
      currentTxState.completed &&
      currentTxState.error &&
      !currentTxState.cancelled
    ) {
      tx?.onError?.()
    } else if (currentTxState?.cancelled) {
      tx?.onCancelled?.()
    }
  })

  if (pendingTransactions.length !== storedPendingTransactions.length) {
    setStoredPendingTransactions(pendingTransactions)
  }

  return null
}
