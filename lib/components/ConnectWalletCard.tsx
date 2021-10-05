import { Card } from '@pooltogether/react-components'
import classNames from 'classnames'
import Link from 'next/link'
import React from 'react'
import { ConnectWalletButton } from './ConnectWalletButton'

interface ConnectWalletCardProps {
  className?: string
}

export const ConnectWalletCard = (props: ConnectWalletCardProps) => {
  const { className } = props
  return (
    <Card className={classNames('flex flex-col mx-auto', className)}>
      <div className='text-xs text-accent-1 font-inter mx-auto mt-2 mb-8 flex flex-col space-y-4'>
        <span>PoolTogether is an cross-chain Prize Pool liquidity protocol.</span>
        <span>To interact with the protocol you will need to have your own Ethereum wallet.</span>
        <span>
          For more info on wallets see{' '}
          <Link href='https://ethereum.org/en/wallets/'>
            <a className='text-xs underline hover:opacity-70 transition-opacity'>here</a>
          </Link>
          .
        </span>
      </div>
      <ConnectWalletButton />
    </Card>
  )
}
