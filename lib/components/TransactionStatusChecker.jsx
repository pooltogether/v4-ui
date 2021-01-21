import { useEffect, useContext } from 'react'
import { useAtom } from 'jotai'

import { TRANSACTIONS_KEY } from 'lib/constants'
import { transactionsAtom } from 'lib/atoms/transactionsAtom'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { checkTransactionStatuses } from 'lib/utils/checkTransactionStatuses'

// bring in new list of tx's from localStorage and check
// if any are ongoing & what their status is
const readTransactions = (transactions, setTransactions, chainId, usersAddress, provider) => {
  try {
    let txs = []
    if (typeof window !== 'undefined') {
      const storageKey = `${chainId}-${usersAddress.toLowerCase()}-${TRANSACTIONS_KEY}`

      txs = JSON.parse(localStorage.getItem(storageKey))
      txs = txs ? txs : []
    }

    txs = txs.filter((tx) => tx.sent && !tx.cancelled)

    // re-write IDs so transactions are ordered properly
    txs = txs.map((tx, index) => (tx.id = index + 1) && tx)

    setTransactions([...txs])
    checkTransactionStatuses(txs, provider, transactions, setTransactions)
  } catch (e) {
    console.error(e)
  }
}

export function TransactionStatusChecker(props) {
  const [transactions, setTransactions] = useAtom(transactionsAtom)
  const { chainId, usersAddress, provider } = useContext(AuthControllerContext)

  useEffect(() => {
    if (chainId && usersAddress && provider) {
      readTransactions(transactions, setTransactions, chainId, usersAddress, provider)
    }
  }, [chainId, usersAddress, provider])

  return null
}
