import React from 'react'
import Link from 'next/link'

import { useTranslation } from 'react-i18next'
import { useOnboard } from '@pooltogether/hooks'
import { EtherscanAddressLink } from 'lib/components/EtherscanAddressLink'
import { shorten } from 'lib/utils/shorten'
import { getNetworkNameAliasByChainId } from '@pooltogether/utilities'

export function WalletInfo(props) {
  const { t } = useTranslation()
  const { closeTransactions } = props

  const { address: usersAddress, network: chainId, disconnectWallet, walletName } = useOnboard()

  let content = null
  let networkName = null

  if (chainId) {
    networkName = <span className={'inline-block'}>{getNetworkNameAliasByChainId(chainId)}</span>
  }

  if (usersAddress && walletName) {
    content = (
      <>
        <div className='flex flex-col w-full justify-between'>
          <div className='flex flex-col w-full text-xxs sm:text-lg lg:text-xl leading-snug trans'>
            <div className='text-xxs xs:text-xs uppercase font-bold text-accent-3'>
              {t('accountAddress')}
            </div>
            <div className='flex justify-between items-center sm:text-xs lg:text-sm text-default mt-1 mb-2 sm:mb-4'>
              <EtherscanAddressLink address={usersAddress}>
                {shorten(usersAddress)}
              </EtherscanAddressLink>
              <Link href='/account' as='/account' shallow>
                <a
                  onClick={(e) => {
                    closeTransactions()
                  }}
                  className='inline-block text-xxs bg-body rounded-full border-2 border-accent-4 px-2 trans trans-fastest font-bold'
                >
                  {t('yourTicketsAndRewards')}
                </a>
              </Link>
            </div>

            <div className='my-2'>
              <div className='text-xxs xs:text-xs uppercase font-bold text-accent-3'>
                {t('connectedTo')}
              </div>
              <div className='flex justify-between items-center sm:text-xs lg:text-sm text-default mt-1 mb-2 sm:mb-4'>
                <div>
                  {walletName}{' '}
                  {chainId && chainId !== 1 && (
                    <>
                      - <span className='capitalize'>{networkName}</span>
                    </>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()

                    closeTransactions()
                    disconnectWallet()
                  }}
                  className='inline-block text-xxs bg-body rounded-full border-2 border-accent-4 px-2 trans trans-fastest font-bold'
                >
                  {t('changeAccount')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return content
}
