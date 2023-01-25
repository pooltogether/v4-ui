import { Button, ButtonProps } from '@pooltogether/react-components'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const ConnectWalletButton: React.FC<Omit<ButtonProps, 'onClick' | 'type'>> = (props) => {
  const { t } = useTranslation()

  return (
    <ConnectButton.Custom>
      {({ openConnectModal, mounted }) => {
        const ready = mounted

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none'
              }
            })}
          >
            <Button {...props} onClick={openConnectModal} type='button'>
              {t('connectWallet')}
            </Button>
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

ConnectWalletButton.defaultProps = {
  className: 'w-full'
}
