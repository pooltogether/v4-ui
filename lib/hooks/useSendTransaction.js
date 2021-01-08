import { useContext } from 'react'

import { WalletContext } from 'lib/components/contextProviders/WalletContextProvider'
import { callTransaction } from 'lib/utils/callTransaction'
import { createTransaction } from 'lib/services/createTransaction'

export const useSendTransaction = function (txName, transactions, setTransactions) {
  const { onboard } = useContext(WalletContext)

  const sendTx = async (
    t,
    provider,
    usersAddress,
    contractAbi,
    contractAddress,
    method,
    params = []
  ) => {
    await onboard.walletCheck()

    const txId = transactions.length + 1

    let newTx = {
      __typename: 'Transaction',
      id: txId,
      name: txName,
      inWallet: true,
      method,
      hash: '',
    }

    transactions = createTransaction(newTx, transactions, setTransactions)

    callTransaction(
      t,
      transactions,
      setTransactions,
      newTx,
      provider,
      usersAddress,
      contractAbi,
      contractAddress,
      method,
      params,
    )

    return txId
  }

  return [sendTx]
}
