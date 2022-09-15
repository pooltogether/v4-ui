import { getExchangeUrl } from '@constants/config'
import { Modal, ModalProps } from '@pooltogether/react-components'
import { CHAIN_ID } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface SwapTokensModalProps extends Omit<ModalProps, 'children'> {
  chainId: number
  tokenAddress: string
}

export const SwapTokensModal = (props: SwapTokensModalProps) => {
  const { chainId, tokenAddress } = props

  const { t } = useTranslation()

  const url = getExchangeUrl(chainId, tokenAddress)

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

SwapTokensModal.defaultProps = {
  chainId: CHAIN_ID.mainnet
}

interface SwapTokensModalTriggerProps {
  buttonLabel?: string
  chainId?: number
  outputCurrencyAddress?: string
  className?: string
}

export const SwapTokensModalTrigger = (props: SwapTokensModalTriggerProps) => {
  const { buttonLabel, chainId, outputCurrencyAddress, className } = props
  const [showModal, setShowModal] = useState(false)

  const { t } = useTranslation()

  return (
    <>
      <button
        className={classNames(
          'min-w-1/4 text-xxxs xs:text-xs text-center text-inverse opacity-60 hover:opacity-100 transition-opacity flex flex-col xs:flex-row items-center space-y-1 xs:space-y-0 xs:space-x-2',
          className
        )}
        onClick={() => setShowModal(true)}
      >
        <FeatherIcon icon={'refresh-cw'} className='relative w-4 h-4' />
        <span>{buttonLabel || t('swapTokens', 'Swap tokens')}</span>
      </button>
      <SwapTokensModal
        label={t('decentralizedExchangeModal', 'Decentralized exchange - modal')}
        chainId={chainId}
        tokenAddress={outputCurrencyAddress}
        isOpen={showModal}
        closeModal={() => setShowModal(false)}
      />
    </>
  )
}
