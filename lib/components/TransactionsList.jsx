import React from 'react'
import { useAtom } from 'jotai'

import { useTranslation } from 'react-i18next'
import { transactionsAtom } from '@pooltogether/react-components'
import { useOnboard } from '@pooltogether/hooks'
import { TransactionsListItem } from 'lib/components/TransactionsListItem'
import { clearPreviousTransactions } from 'lib/services/clearPreviousTransactions'
import { useGovernanceChainId } from 'lib/hooks/useGovernanceChainId'

export function TransactionsList(props) {
  const { t } = useTranslation()

  const [transactions, setTransactions] = useAtom(transactionsAtom)

  const { address: usersAddress } = useOnboard()
  const chainId = useGovernanceChainId()

  const notCancelledTransactions = transactions.filter((t) => !t.cancelled).reverse()

  const pendingTransactionsCount = transactions.filter((t) => !t.completed && !t.cancelled).length

  const pastTransactionsCount = transactions.filter((t) => t.completed && !t.cancelled).length

  const handleClearPrevious = (e) => {
    e.preventDefault()

    if (usersAddress && chainId) {
      clearPreviousTransactions(transactions, setTransactions, usersAddress, chainId)
    }
  }

  if (!usersAddress) {
    return null
  }

  return (
    <>
      <div className='px-8 sm:px-10 pt-8'>
        <div className='flex justify-between items-center text-xxs xs:text-xs uppercase font-bold text-accent-3'>
          <div>
            {t('recentTransactions')}{' '}
            {pendingTransactionsCount > 0 && (
              <>
                <span className='text-accent-1 text-xxxs uppercase opacity-50'>
                  {t('pendingTransactionsCount', { count: pendingTransactionsCount })}
                </span>
              </>
            )}
          </div>

          {pastTransactionsCount > 0 && (
            <>
              <button
                onClick={handleClearPrevious}
                className='inline-block text-xxs bg-body rounded-full border-2 border-accent-4 px-2 trans trans-fastest font-bold'
              >
                {t('clearHistory')}
              </button>
            </>
          )}
        </div>
      </div>

      <div className='dialog-inner-content flex-grow relative flex flex-col w-full pb-2 text-xs sm:text-sm'>
        {notCancelledTransactions.length === 0 ? (
          <>
            <div className='text-default-soft px-8 sm:px-10 pb-4 uppercase text-xs mt-4'>
              {t('currentlyNoActiveTransactions')}
              {/* CURRENTLY NO ACTIVE TRANSACTIONS */}
            </div>
          </>
        ) : (
          <>
            <ul className='transactions-ui-list overflow-x-hidden overflow-y-auto px-8 sm:px-10 py-4'>
              {notCancelledTransactions.map((tx) => {
                return <TransactionsListItem key={tx.id} tx={tx} />
              })}
            </ul>
          </>
        )}
      </div>
    </>
  )
}
