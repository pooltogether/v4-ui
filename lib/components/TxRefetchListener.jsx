import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { transactionsAtom } from '@pooltogether/hooks'

const debug = require('debug')('pool-app:TxRefetchListener')

export function TxRefetchListener(props) {
  const [transactions] = useAtom(transactionsAtom)

  const [storedPendingTransactions, setStoredPendingTransactions] = useState([])

  const pendingTransactions = transactions.filter((t) => !t.completed && !t.cancelled)

  useEffect(() => {
    if (pendingTransactions.length !== storedPendingTransactions.length) {
      setStoredPendingTransactions(pendingTransactions)
    }

    console.log('something changed ...')
    console.log(pendingTransactions)

    checkStoredPending(transactions, storedPendingTransactions)
  }, [pendingTransactions])

  return null
}

const runRefetch = (tx) => {
  // we don't know when the Graph will have processed the new block data or when it has
  // so simply query a few times for the updated data
  console.log(tx?.refetch)

  if (tx?.refetch) {
    console.log(tx.refetch)
    tx.refetch()
    setTimeout(() => {
      tx.refetch()
      debug('refetch!')
      console.log({ tx })
      console.log('refetch')
    }, 2000)

    setTimeout(() => {
      tx.refetch()
      debug('refetch!')
      console.log('refetch')
    }, 8000)
  }
}

const checkStoredPending = (transactions, storedPendingTransactions) => {
  console.log('in checkStoredPending')
  storedPendingTransactions.forEach((tx) => {
    const storedTxId = tx.id
    const currentTxState = transactions.find((_tx) => _tx.id === storedTxId)
    console.log('storedPending,', storedPendingTransactions)

    if (
      currentTxState &&
      currentTxState.completed &&
      !currentTxState.error &&
      !currentTxState.cancelled
    ) {
      console.log(tx)
      tx?.onSuccess?.()
      console.log('hi!')

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
}
