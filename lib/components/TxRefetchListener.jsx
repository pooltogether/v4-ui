import { useContext, useState } from 'react'
import { useAtom } from 'jotai'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { usePools } from 'lib/hooks/usePools'
import { useAccount } from 'lib/hooks/useAccount'
import { transactionsAtom } from 'lib/atoms/transactionsAtom'

const debug = require('debug')('pool-app:TxRefetchListener')

export function TxRefetchListener(props) {
  const [transactions] = useAtom(transactionsAtom)

  const [storedPendingTransactions, setStoredPendingTransactions] = useState([])

  const { usersAddress } = useContext(AuthControllerContext)
  const { refetchPoolsData } = usePools()
  
  // fill this in with a watched address or an address from router params
  const playerAddress = ''
  const address = playerAddress || usersAddress

  const { refetchAccountData } = useAccount(address)

  const pendingTransactions = transactions
    .filter(t => !t.completed && !t.cancelled)


  const runRefetch = (tx) => {
    const playerBalanceTransaction = tx.method === 'depositTo' ||
      tx.method === 'transfer' ||
      tx.method === 'approve' ||
      tx.method === 'withdrawInstantlyFrom' ||
      tx.method === 'updateAndClaimDrips'

    const poolStateTransaction = tx.method === 'startAward' ||
      tx.method === 'completeAward'

    if (playerBalanceTransaction) {
      // we don't know when the Graph will have processed the new block data or when it has
      // so simply query a few times for the updated data
      setTimeout(() => {
        refetchAccountData()
        debug('refetch!')
      }, 2000)

      setTimeout(() => {
        refetchAccountData()
        debug('refetch!')
      }, 8000)

      setTimeout(() => {
        refetchAccountData()
        debug('refetch!')
      }, 16000)
    } else if (poolStateTransaction) {
      setTimeout(() => {
        refetchPoolsData()
        debug('refetch pool/prize!')
      }, 6000)
    }
  }

  storedPendingTransactions.forEach(tx => {
    const storedTxId = tx.id
    const currentTxState = transactions.find((_tx) => _tx.id === storedTxId)

    if (
      currentTxState &&
      currentTxState.completed &&
      !currentTxState.error && 
      !currentTxState.cancelled
    ) {
      runRefetch(tx)
    }
  })

  if (pendingTransactions.length !== storedPendingTransactions.length) {
    setStoredPendingTransactions(pendingTransactions)
  }

  return null
}
