import React from 'react'
import FeatherIcon from 'feather-icons-react'
import { Modal, ModalProps } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId, NETWORK } from '@pooltogether/utilities'
import { useTranslation } from 'react-i18next'

interface BridgeTokensModalProps extends ModalProps {
  chainId: number
}

const BRIDGE_URLS = Object.freeze({
  [NETWORK.mainnet]: [
    { url: 'https://zapper.fi/bridge', title: 'Zapper' },
    { url: 'https://wallet.polygon.technology/bridge', title: 'Polygon bridge' },
    { url: 'https://app.hop.exchange/send?token=USDC', title: 'Hop Protocol' }
  ],
  [NETWORK.rinkeby]: [
    { url: 'https://zapper.fi/bridge', title: 'Zapper' },
    { url: 'https://wallet.polygon.technology/bridge', title: 'Polygon bridge' },
    { url: 'https://app.hop.exchange/send?token=USDC', title: 'Hop Protocol' }
  ],
  [NETWORK.mumbai]: [
    { url: 'https://zapper.fi/bridge', title: 'Zapper' },
    { url: 'https://wallet.polygon.technology/bridge', title: 'Polygon bridge' },
    { url: 'https://app.hop.exchange/send?token=USDC', title: 'Hop Protocol' }
  ],
  [NETWORK.polygon]: [
    { url: 'https://zapper.fi/bridge', title: 'Zapper' },
    { url: 'https://wallet.polygon.technology/bridge', title: 'Polygon bridge' },
    { url: 'https://app.hop.exchange/send?token=USDC', title: 'Hop Protocol' }
  ]
})

export const BridgeTokensModal = (props: BridgeTokensModalProps) => {
  const { chainId } = props

  const { t } = useTranslation()

  const links = BRIDGE_URLS[chainId]

  return (
    <Modal
      noSize
      noBgColor
      isOpen={Boolean(props.isOpen)}
      className='shadow-3xl py-12 bg-new-modal h-full sm:h-auto sm:max-w-md'
      label={`Get Tokens Modal`}
      closeModal={props.closeModal}
    >
      <div className='flex flex-col'>
        <span className='text-xl'>Bridge to {getNetworkNiceNameByChainId(chainId)}</span>
        <span className='text-accent-1 mb-4'>
          Check out these services to move your tokens to {getNetworkNiceNameByChainId(chainId)}
        </span>
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
  chainId: NETWORK.mainnet
}
