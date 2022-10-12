import { Button, ButtonProps, ThemedClipSpinner } from '@pooltogether/react-components'
import { useConnectWallet } from '@pooltogether/wallet-connection'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { useAccount } from 'wagmi'

export const ConnectWalletButton: React.FC<Omit<ButtonProps, 'onClick' | 'type'>> = (props) => {
  const connectWallet = useConnectWallet()
  const { status } = useAccount()
  const { t } = useTranslation()
  return (
    <Button {...props} onClick={() => connectWallet()} type='button'>
      {status === 'connecting' ? (
        <>
          {t('connecting')}{' '}
          <ThemedClipSpinner className='opacity-50 ml-2' sizeClassName='w-3 h-3' />
        </>
      ) : (
        t('connectWallet')
      )}
    </Button>
  )
}

ConnectWalletButton.defaultProps = {
  className: 'w-full'
}
