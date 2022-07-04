import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@pooltogether/react-components'
import { useConnectWallet } from '@pooltogether/wallet-connection'

interface ConnectWalletButtonProps {
  className?: string
}

export const ConnectWalletButton = (props: ConnectWalletButtonProps) => {
  const { className } = props
  const connectWallet = useConnectWallet()
  const { t } = useTranslation()
  return (
    <Button className={className} onClick={() => connectWallet()} type='button'>
      {t('connectWallet')}
    </Button>
  )
}

ConnectWalletButton.defaultProps = {
  className: 'w-full'
}
