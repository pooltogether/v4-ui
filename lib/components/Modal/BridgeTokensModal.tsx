import { Modal, ModalProps } from '.yalc/@pooltogether/react-components/dist'
import { NETWORK } from '@pooltogether/utilities'
import React from 'react'
import { useTranslation } from 'react-i18next'
import FeatherIcon from 'feather-icons-react'

interface BridgeTokensModalProps extends ModalProps {
  chainId: number
}

const BRIDGE_URLS = Object.freeze({
  [NETWORK.mainnet]: 'https://wallet.polygon.technology/bridge/',
  [NETWORK.rinkeby]: 'https://wallet.polygon.technology/bridge/',
  [NETWORK.mumbai]: 'https://wallet.polygon.technology/bridge/',
  [NETWORK.polygon]: 'https://wallet.polygon.technology/bridge/'
})

export const BridgeTokensModal = (props: BridgeTokensModalProps) => {
  const { chainId } = props

  const { t } = useTranslation()

  const url = BRIDGE_URLS[chainId]

  return (
    <Modal
      noSize
      noBgColor
      noPad
      isOpen={Boolean(props.isOpen)}
      className='shadow-3xl pt-16 bg-new-modal h-full sm:h-auto sm:max-w-xl'
      label={`Get Tokens Modal`}
      closeModal={props.closeModal}
    >
      <a
        className='absolute top-6 left-4 flex text-sm text-accent-1 transition-color hover:text-white'
        href={url}
        target='_blank'
        rel='noopener noreferrer'
      >
        Open bridge in a new tab
        <FeatherIcon icon={'external-link'} className='w-4 h-4 ml-2 my-auto' />
      </a>
      <iframe
        className='w-full h-full sm:h-75vh rounded-b-lg'
        src={url}
        title='Ethereum to L2 bridge'
        loading='lazy'
        referrerPolicy='no-referrer'
      />
    </Modal>
  )
}

BridgeTokensModal.defaultProps = {
  chainId: NETWORK.mainnet
}
