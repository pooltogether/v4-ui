import React from 'react'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'react-i18next'
import { Modal, ModalProps } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'

import { ModalTitle } from 'lib/components/Modal/ModalTitle'
import { CHAIN_ID } from 'lib/constants/constants'

interface BridgeTokensModalProps extends ModalProps {
  chainId: number
}

const BRIDGE_URLS = Object.freeze({
  [CHAIN_ID.mainnet]: [
    { url: 'https://zapper.fi/bridge', title: 'Zapper' },
    { url: 'https://wallet.polygon.technology/bridge', title: 'Polygon bridge' },
    { url: 'https://app.hop.exchange/send?token=USDC', title: 'Hop Protocol' }
  ],
  [CHAIN_ID.rinkeby]: [
    { url: 'https://zapper.fi/bridge', title: 'Zapper' },
    { url: 'https://wallet.polygon.technology/bridge', title: 'Polygon bridge' },
    { url: 'https://app.hop.exchange/send?token=USDC', title: 'Hop Protocol' }
  ],
  [CHAIN_ID.mumbai]: [
    { url: 'https://zapper.fi/bridge', title: 'Zapper' },
    { url: 'https://wallet.polygon.technology/bridge', title: 'Polygon bridge' },
    { url: 'https://app.hop.exchange/send?token=USDC', title: 'Hop Protocol' }
  ],
  [CHAIN_ID.polygon]: [
    { url: 'https://zapper.fi/bridge', title: 'Zapper' },
    { url: 'https://wallet.polygon.technology/bridge', title: 'Polygon bridge' },
    { url: 'https://app.hop.exchange/send?token=USDC', title: 'Hop Protocol' }
  ]
})

export const BridgeTokensModal = (props: BridgeTokensModalProps) => {
  const { chainId } = props

  const { t } = useTranslation()

  const links = BRIDGE_URLS[chainId]

  const networkName = getNetworkNiceNameByChainId(chainId)

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
          title={t('bridgeToNetwork', 'Bridge to {{networkName}}', {
            networkName
          })}
        />

        <p className='text-white opacity-60 mt-4 mb-6'>
          {t(
            'checkOutThese',
            'Make use of one of these services to move your tokens to {{networkName}}',
            {
              networkName
            }
          )}
          :
        </p>
        <ul className='space-y-2'>
          {links.map((link) => (
            <BridgeLink {...link} key={link.title} />
          ))}
        </ul>
      </div>
    </Modal>
  )
}

const BridgeLink = (props: { url: string; title: string }) => {
  const { url, title } = props
  return (
    <li>
      <a
        className='flex text-sm text-accent-1 transition-colors hover:text-white'
        href={url}
        target='_blank'
        rel='noopener noreferrer'
      >
        {title}
        <FeatherIcon icon={'external-link'} className='w-4 h-4 ml-2 my-auto' />
      </a>
    </li>
  )
}

BridgeTokensModal.defaultProps = {
  chainId: CHAIN_ID.mainnet
}
