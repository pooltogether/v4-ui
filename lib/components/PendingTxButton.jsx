import React from 'react'
import { useAtom } from 'jotai'

import { useTranslation } from 'react-i18next'
import { transactionsAtom } from '@pooltogether/react-components'
// import { LoadingSpinner } from 'lib/components/LoadingSpinner'
import ClipLoader from 'react-spinners/ClipLoader'

export function PendingTxButton(props) {
  const { t } = useTranslation()
  const [transactions] = useAtom(transactionsAtom)

  const { openTransactions } = props

  const pendingTransactionsCount = transactions.filter((t) => !t.completed).length

  if (pendingTransactionsCount < 1) {
    return null
  }

  return (
    <button
      onClick={openTransactions}
      className='items-center text-green hover:text-inverse font-bold text-xxs sm:text-xs trans tracking-wider outline-none focus:outline-none active:outline-none relative block xs:ml-2 px-2 h-8'
    >
      <div className='inline-block mr-1'>
        <ClipLoader size={10} color='rgba(255,255,255,0.3)' />
      </div>{' '}
      {t('pendingTransactionsCount', { count: pendingTransactionsCount })}
    </button>
  )
}
