import { updateStorageWith } from 'lib/utils/updateStorageWith'

export const updateTransaction = (id, newValues, transactions, setTransactions) => {
  let editedTransactions = transactions.map((transaction) => {
    return transaction.id === id
      ? {
          ...transaction,
          ...newValues
        }
      : transaction
  })

  // runs the actual update of the data store
  const updatedTransactions = [...editedTransactions]
  setTransactions(updatedTransactions)

  // stash in localStorage to persist state between page reloads
  updateStorageWith(updatedTransactions)

  return updatedTransactions
}
