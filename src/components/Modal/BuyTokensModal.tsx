import { CBPayInstanceType, initOnRamp } from '@coinbase/cbpay-js'
import React, { useEffect, useRef, useState } from 'react'
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
import { CHAIN_ID, useUsersAddress } from '@pooltogether/wallet-connection'
import { useChainNativeCurrency } from '@hooks/useChainNativeCurrency'
import { DISCORD_INVITE_URL } from '@constants/misc'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { COINBASE_CHAIN_KEYS, getCoinbaseChainAssets, getCoinbaseChainKey } from '@constants/config'
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
  const [onRampInstance, setOnRampInstance] = useState<CBPayInstanceType | undefined>()
  const usersAddress = useUsersAddress()
  const { t } = useTranslation()
  const chainKey = getCoinbaseChainKey(chainId)
  const supportedCoinbaseChainIds = Object.keys(COINBASE_CHAIN_KEYS).map(Number)

  useEffect(() => {
    initOnRamp(
      {
        appId: process.env.NEXT_PUBLIC_COINBASE_PAY_APP_ID,
        // widgetParameters: {
        //   destinationWallets: !!chainKey
        //     ? [
        //         {
        //           address: usersAddress,
        //           blockchains: [chainKey],
        //           assets: getCoinbaseChainAssets(chainId)
        //         }
        //       ]
        //     : supportedCoinbaseChainIds.map((chainId) => ({
        //         address: usersAddress,
        //         blockchains: [getCoinbaseChainKey(chainId)],
        //         assets: getCoinbaseChainAssets(chainId)
        //       }))
        // },
        widgetParameters: {
          destinationWallets: [
            {
              address: usersAddress,
              blockchains: ['ethereum'],
              assets: ['ETH']
            }
          ]
        },
        experienceLoggedIn: 'popup',
        experienceLoggedOut: 'popup',
        closeOnExit: true,
        closeOnSuccess: true,
        onSuccess: () => {
          console.log('success')
        },
        onExit: () => {
          console.log('exit')
        },
        onEvent: (event) => {
          console.log('event', event)
        }
      },
      (_, instance) => {
        setOnRampInstance(instance)
      }
    )

    return () => {
      onRampInstance?.destroy()
      setOnRampInstance(undefined)
    }
  }, [])

  const handleClick = () => {
    onRampInstance?.open()
  }

  const disabled = !process.env.NEXT_PUBLIC_COINBASE_PAY_APP_ID || !onRampInstance

  return (
    <a
      id='cbpay-button-container'
      className={classNames('flex text-xl items-center space-x-2 transition hover:opacity-90', {
        'opacity-50 pointer-events-none': disabled
      })}
      onClick={handleClick}
    >
      <img src={'/buy-with-coinbase-pay.png'} />
    </a>
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
          )}, ${getNetworkNiceNameByChainId(CHAIN_ID.avalanche)}, ${getNetworkNiceNameByChainId(
            CHAIN_ID.polygon
          )} `
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
