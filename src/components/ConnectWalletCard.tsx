import { Card } from '@pooltogether/react-components'
import classNames from 'classnames'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ConnectWalletButton } from './ConnectWalletButton'

interface ConnectWalletCardProps {
  className?: string
}

export const ConnectWalletCard = (props: ConnectWalletCardProps) => {
  const { className } = props

  const { t } = useTranslation()

  return (
    <Card className={classNames('flex flex-col mx-auto', className)}>
      <div className='text-xs text-accent-1 mx-auto mt-2 mb-8 flex flex-col space-y-4'>
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
          {t('forMoreInfoOnWalletSee', 'Connect to your existing wallet or')}
          <a
            href='https://docs.pooltogether.com/'
            target='_blank'
            rel='noreferrer noopener'
            className='underline hover:opacity-70 transition-opacity ml-1'
          >
            {t('learnMoreAboutProtocol')}
          </a>
          .
        </span>
      </div>
      <ConnectWalletButton />
    </Card>
  )
}
