import React from 'react'
import Link from 'next/link'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { Card } from '@pooltogether/react-components'

import { ConnectWalletButton } from './ConnectWalletButton'

interface ConnectWalletCardProps {
  className?: string
}

export const ConnectWalletCard = (props: ConnectWalletCardProps) => {
  const { className } = props

  const { t } = useTranslation()

  return (
    <Card className={classNames('flex flex-col mx-auto', className)}>
      <div className='text-sm text-accent-1 font-inter mx-auto mt-2 mb-8 flex flex-col space-y-4'>
        <span className='text-lg text-inverse font-semibold'>
          {t(
            'poolTogetherIsACrossChainProtocol',
            'PoolTogether is a cross-chain Prize Pool liquidity protocol.'
          )}
        </span>
        <span>
          {t(
            'toInteractWithTheProtocol',
            'To interact with the protocol you will need to have your own Ethereum wallet.'
          )}
        </span>
        <span>
          {t('forMoreInfoOnWalletSee:', 'For more info on wallets, see')}:<br />
          <a
            href='https://ethereum.org/en/wallets/'
            target='_blank'
            rel='noreferrer noopener'
            className='underline hover:opacity-70 transition-opacity'
          >
            ethereum.org - {t('wallets', 'wallets')}
          </a>
        </span>
      </div>
      <ConnectWalletButton />
    </Card>
  )
}
