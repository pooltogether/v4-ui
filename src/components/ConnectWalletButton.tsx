import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button, ButtonProps } from '@pooltogether/react-components'
import { useConnectWallet } from '@pooltogether/wallet-connection'

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
