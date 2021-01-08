import { updateStorageWith } from 'lib/utils/updateStorageWith'

export const createTransaction = (newTx, transactions, setTransactions) => {
  const newTransactions = [...transactions, newTx]
  setTransactions(newTransactions)

  // stash in localStorage to persist state between page reloads
  updateStorageWith(newTransactions)

  return newTransactions
}
