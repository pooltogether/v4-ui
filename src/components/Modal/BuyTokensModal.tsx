import { initOnRamp } from '@coinbase/cbpay-js'
import React, { useEffect, useRef } from 'react'
import FeatherIcon from 'feather-icons-react'
import { Trans, useTranslation } from 'react-i18next'
import {
  Modal,
  ModalProps,
  ModalTitle,
  ExchangeIcon,
  ExchangeKey,
  ExternalLink
} from '@pooltogether/react-components'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useChainNativeCurrency } from '@hooks/useChainNativeCurrency'
import { CHAIN_ID, DISCORD_INVITE_URL } from '@constants/misc'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { getCoinbaseChainKey } from '@constants/config'
import classNames from 'classnames'

/**
 * Currently just a Coinbase Pay modal but will be extended to include other on ramps in the future.
 * @param props
 * @returns
 */
export const BuyTokensModal: React.FC<{ chainId: number } & Omit<ModalProps, 'children'>> = (
  props
) => {
  const { chainId } = props
  const { t } = useTranslation()
  const nativeCurrency = useChainNativeCurrency(chainId)

  return (
    <Modal
      isOpen={Boolean(props.isOpen)}
      paddingClassName='px-2 xs:px-8 py-10'
      maxWidthClassName='sm:max-w-md'
      label={t('getTokensModal', 'Get tokens - modal window')}
      closeModal={props.closeModal}
    >
      <div className='flex flex-col'>
        <ModalTitle
          chainId={chainId}
          title={t('buyTokensFor', { networkName: getNetworkNiceNameByChainId(chainId) })}
        />

        <p className='text-inverse opacity-60 mt-4 mb-6'>
          <Trans
            i18nKey='buyTokensDescription'
            values={{ nativeCurrency }}
            components={{
              a: <ExternalLink underline href={DISCORD_INVITE_URL} />
            }}
          />
        </p>
        <div className='flex flex-col'>
          <PayWithCoinbaseButton chainId={chainId} />
          <TemporaryWarningForNoOnRamp chainId={chainId} />
        </div>
      </div>
    </Modal>
  )
}

const PayWithCoinbaseButton: React.FC<{ chainId: number }> = (props) => {
  const { chainId } = props
  const onrampInstance = useRef()
  const usersAddress = useUsersAddress()
  const { t } = useTranslation()
  const chainKey = getCoinbaseChainKey(chainId)
  const mainnetChainKey = getCoinbaseChainKey(CHAIN_ID.mainnet)

  useEffect(() => {
    onrampInstance.current = initOnRamp({
      appId: process.env.NEXT_PUBLIC_COINBASE_PAY_APP_ID,
      widgetParameters: {
        destinationWallets: [
          {
            address: usersAddress,
            blockchains: [!!chainKey ? chainKey : mainnetChainKey]
          }
        ]
      },
      experienceLoggedIn: 'popup',
      experienceLoggedOut: 'popup',
      closeOnExit: true,
      closeOnSuccess: true
    })

    return () => {
      onrampInstance.current?.destroy()
    }
  }, [])

  const handleClick = () => {
    onrampInstance.current?.open()
  }

  const disabled = !usersAddress || !process.env.NEXT_PUBLIC_COINBASE_PAY_APP_ID

  return (
    <button
      className={classNames('flex text-xl items-center space-x-2 transition hover:opacity-50', {
        'opacity-50': disabled
      })}
      onClick={handleClick}
      disabled={disabled}
    >
      <ExchangeIcon exchange={ExchangeKey.coinbase} sizeClassName='w-6 h-6' />
      <span>{t('buyOnCoinbase')}</span>
      <FeatherIcon icon={'external-link'} className='w-4 h-4 my-auto' />
    </button>
  )
}

const TemporaryWarningForNoOnRamp: React.FC<{ chainId: number }> = (props) => {
  const { chainId } = props
  const usersAddress = useUsersAddress()
  const chainKey = getCoinbaseChainKey(chainId)
  const { t } = useTranslation()

  if (!chainKey) {
    return (
      <div className='text-xxxs xs:text-xxs text-pt-red-light mt-4 xs:mt-6'>
        {t('coinbasePayWarning', {
          networkName: getNetworkNiceNameByChainId(chainId),
          supportedNetworks: `${getNetworkNiceNameByChainId(
            CHAIN_ID.mainnet
          )}, ${getNetworkNiceNameByChainId(CHAIN_ID.avalanche)}`
        })}
      </div>
    )
  } else if (!usersAddress) {
    return (
      <div className='text-xxxs xs:text-xxs text-pt-red-light mt-4 xs:mt-6'>
        {t('connectAWalletToProceed', 'Connect a wallet to proceed.')}
      </div>
    )
  }
  return null
}
