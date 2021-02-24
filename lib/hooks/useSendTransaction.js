import { useContext } from 'react'
import { useAtom } from 'jotai'

import { WalletContext } from 'lib/components/contextProviders/WalletContextProvider'
import { useTranslation } from 'lib/../i18n'
import { callTransaction } from 'lib/utils/callTransaction'
import { createTransaction } from 'lib/services/createTransaction'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { transactionsAtom } from 'lib/atoms/transactionsAtom'

export const useSendTransaction = function () {
  const [transactions, setTransactions] = useAtom(transactionsAtom)
  const { onboard } = useContext(WalletContext)
  const { usersAddress, provider } = useContext(AuthControllerContext)
  const { t } = useTranslation()

  const sendTx = async (txDetails) => {
    const defaultTxDetails = {
      txName: '',
      contractAbi: [],
      contractAddress: '',
      method: '',
      value: 0,
      params: [],
      callbacks: {}
    }
    const {
      txName,
      contractAbi,
      contractAddress,
      method,
      value,
      params,
      callbacks
    } = Object.assign(defaultTxDetails, txDetails)

    await onboard.walletCheck()

    const txId = transactions.length + 1

    let newTx = {
      __typename: 'Transaction',
      id: txId,
      name: txName,
      inWallet: true,
      method,
      hash: '',
      ...callbacks
    }

    let updatedTransactions = createTransaction(newTx, transactions, setTransactions)

    callTransaction(
      t,
      updatedTransactions,
      setTransactions,
      newTx,
      provider,
      usersAddress,
      contractAbi,
      contractAddress,
      method,
      params,
      value
    )

    return txId
  }

  return sendTx
}
