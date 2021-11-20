import React from 'react'
import FeatherIcon from 'feather-icons-react'
import { Modal, ModalProps } from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'
import { CHAIN_ID } from 'lib/constants/constants'

interface GetTokensModalProps extends ModalProps {
  chainId: number
  tokenAddress: string
}

const EXCHANGE_URLS = Object.freeze({
  [CHAIN_ID.mainnet]: (tokenAddress: string) =>
    `https://app.uniswap.org/#/swap?theme=dark&outputCurrency=${tokenAddress}`,
  [CHAIN_ID.rinkeby]: (tokenAddress: string) =>
    `https://app.uniswap.org/#/swap?theme=dark&outputCurrency=${tokenAddress}`,
  [CHAIN_ID.polygon]: (tokenAddress: string) =>
    `https://quickswap.exchange/#/swap?theme=dark&outputCurrency=${tokenAddress}`,
  [CHAIN_ID.mumbai]: (tokenAddress: string) =>
    `https://quickswap.exchange/#/swap?theme=dark&outputCurrency=${tokenAddress}`
})

export const GetTokensModal = (props: GetTokensModalProps) => {
  const { chainId } = props

  const { t } = useTranslation()

  const url = EXCHANGE_URLS[chainId](props.tokenAddress)

  return (
    <Modal
      isOpen={Boolean(props.isOpen)}
      paddingClassName='pt-20'
      maxWidthClassName='sm:max-w-xl'
      label={t('getTokensModal', 'Get Tokens - modal')}
      closeModal={props.closeModal}
      style={{ paddingTop: 70 }}
    >
      <a
        className='absolute top-6 left-6 flex text-sm text-accent-1 transition-colors hover:text-inverse'
        href={url}
        target='_blank'
        rel='noopener noreferrer'
      >
        {t('openExchangeInNewTab', 'Open exchange in new tab')}
        <FeatherIcon icon={'external-link'} className='w-4 h-4 ml-2 my-auto' />
      </a>
      <iframe
        className='w-full h-full sm:h-75vh rounded-b-lg'
        src={url}
        title={t('decentralizedExchange', 'Decentralized exchange')}
        loading='lazy'
        referrerPolicy='no-referrer'
      />
    </Modal>
  )
}

GetTokensModal.defaultProps = {
  chainId: CHAIN_ID.mainnet
}
