import { useAtom } from 'jotai'
import { transactionsAtom } from '@pooltogether/react-components'

export const useTransaction = (txId) => {
  const [transactions] = useAtom(transactionsAtom)
  if (!txId) return null
  return transactions?.find((tx) => tx.id === txId)
}
