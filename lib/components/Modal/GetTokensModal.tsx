import { Modal, ModalProps } from '@pooltogether/react-components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { NETWORK } from '@pooltogether/utilities'
import FeatherIcon from 'feather-icons-react'

interface GetTokensModalProps extends ModalProps {
  chainId: number
  tokenAddress: string
}

const EXCHANGE_URLS = Object.freeze({
  [NETWORK.mainnet]: (tokenAddress: string) =>
    `https://app.uniswap.org/#/swap?theme=dark&outputCurrency=${tokenAddress}`,
  [NETWORK.rinkeby]: (tokenAddress: string) =>
    `https://app.uniswap.org/#/swap?theme=dark&outputCurrency=${tokenAddress}`,
  [NETWORK.polygon]: (tokenAddress: string) =>
    `https://quickswap.exchange/#/swap?theme=dark&outputCurrency=${tokenAddress}`,
  [NETWORK.mumbai]: (tokenAddress: string) =>
    `https://quickswap.exchange/#/swap?theme=dark&outputCurrency=${tokenAddress}`
})

export const GetTokensModal = (props: GetTokensModalProps) => {
  const { chainId } = props

  const { t } = useTranslation()

  const url = EXCHANGE_URLS[chainId](props.tokenAddress)

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
        className='absolute top-6 left-4 flex text-sm text-accent-1 transition-colors hover:text-white'
        href={url}
        target='_blank'
        rel='noopener noreferrer'
      >
        Open exchange in a new tab
        <FeatherIcon icon={'external-link'} className='w-4 h-4 ml-2 my-auto' />
      </a>
      <iframe
        className='w-full h-full sm:h-75vh rounded-b-lg'
        src={url}
        title='Decentralized exchange'
        loading='lazy'
        referrerPolicy='no-referrer'
      />
    </Modal>
  )
}

GetTokensModal.defaultProps = {
  chainId: NETWORK.mainnet
}
