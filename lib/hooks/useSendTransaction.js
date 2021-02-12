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

  const sendTx = async (txName, contractAbi, contractAddress, method, params = [], refetch) => {
    await onboard.walletCheck()

    const txId = transactions.length + 1

    let newTx = {
      __typename: 'Transaction',
      id: txId,
      name: txName,
      inWallet: true,
      method,
      hash: '',
      refetch
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
      params
    )

    return txId
  }

  return sendTx
}
