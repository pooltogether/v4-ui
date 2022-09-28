import { Button, ButtonProps } from '@pooltogether/react-components'
import { useConnectWallet } from '@pooltogether/wallet-connection'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const ConnectWalletButton: React.FC<Omit<ButtonProps, 'onClick' | 'type'>> = (props) => {
  const connectWallet = useConnectWallet()
  const { t } = useTranslation()
  return (
    <Button {...props} onClick={() => connectWallet()} type='button'>
      {t('connectWallet')}
    </Button>
  )
}

ConnectWalletButton.defaultProps = {
  className: 'w-full'
}
