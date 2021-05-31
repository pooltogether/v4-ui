import React from 'react'
import FeatherIcon from 'feather-icons-react'

import { useTranslation } from 'react-i18next'
import { EtherscanTxLink } from 'lib/components/EtherscanTxLink'
import { PTHint } from 'lib/components/PTHint'
import { LoadingSpinner } from 'lib/components/LoadingSpinner'

export function TransactionsListItem(props) {
  const { t } = useTranslation()

  const { tx } = props

  const errorIcon = (
    <FeatherIcon icon='help-circle' className='list-item--icon relative w-5 h-5 text-red' />
  )

  return (
    <li key={tx.hash || Date.now()} className='list-item rounded-lg relative p-2 -mx-2'>
      <div className='flex justify-between w-full'>
        <div className='pr-2'>
          {tx.hash ? (
            <>
              <EtherscanTxLink chainId={tx.ethersTx.chainId} hash={tx.hash}>
                {tx.name}
              </EtherscanTxLink>
            </>
          ) : (
            tx.name
          )}
        </div>

        <div className='w-5'>
          {!tx.completed && (
            <>
              <div
                className='-l-1 -t-2'
                style={{
                  transform: 'scale(0.9)'
                }}
              >
                <LoadingSpinner />
              </div>
            </>
          )}

          {tx.completed && !tx.error && (
            <>
              <EtherscanTxLink noIcon chainId={tx.ethersTx.chainId} hash={tx.hash}>
                <FeatherIcon
                  icon='check-circle'
                  className='list-item--icon relative w-5 h-5 text-green'
                />
              </EtherscanTxLink>
            </>
          )}

          {tx.reason && (
            <>
              <PTHint tip={tx.reason}>{errorIcon}</PTHint>
            </>
          )}

          {tx.error && !tx.reason && (
            <>
              <EtherscanTxLink noIcon chainId={tx.ethersTx.chainId} hash={tx.hash}>
                {errorIcon}
              </EtherscanTxLink>
            </>
          )}
        </div>
      </div>

      {tx.inWallet && (
        <>
          <span className='text-orange'>
            {tx.inWallet && <>{t('pleaseConfirmInYourWallet')}</>}
          </span>
        </>
      )}
    </li>
  )
}
