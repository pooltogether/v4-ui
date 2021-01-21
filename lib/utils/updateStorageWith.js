import { TRANSACTIONS_KEY } from 'lib/constants'

export const updateStorageWith = (transactions, usersAddress, chainId) => {
  const sentTransactions = transactions.filter((tx) => {
    return tx.sent && !tx.cancelled
  })

  chainId = chainId || sentTransactions?.[0]?.ethersTx?.chainId
  usersAddress = usersAddress || sentTransactions?.[0]?.ethersTx?.from

  if (chainId && usersAddress) {
    const txsData = JSON.stringify(sentTransactions)

    try {
      const storageKey = `${chainId}-${usersAddress.toLowerCase()}-${TRANSACTIONS_KEY}`

      localStorage.setItem(storageKey, txsData)
    } catch (e) {
      console.error(e)
    }
  }
}
