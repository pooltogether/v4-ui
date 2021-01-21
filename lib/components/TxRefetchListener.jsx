import { useState } from 'react'
import { useAtom } from 'jotai'
import { transactionsAtom } from 'lib/atoms/transactionsAtom'

const debug = require('debug')('pool-app:TxRefetchListener')

// TODO: Look into moving this into a useEffect ?
export function TxRefetchListener(props) {
  const [transactions] = useAtom(transactionsAtom)

  const [storedPendingTransactions, setStoredPendingTransactions] = useState([])

  const pendingTransactions = transactions.filter((t) => !t.completed && !t.cancelled)

  storedPendingTransactions.forEach((tx) => {
    const storedTxId = tx.id
    const currentTxState = transactions.find((_tx) => _tx.id === storedTxId)

    if (
      currentTxState &&
      currentTxState.completed &&
      !currentTxState.error &&
      !currentTxState.cancelled
    ) {
      tx?.callback?.()
    }
  })

  if (pendingTransactions.length !== storedPendingTransactions.length) {
    setStoredPendingTransactions(pendingTransactions)
  }

  return null
}
