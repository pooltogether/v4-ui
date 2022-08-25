import React from 'react'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'react-i18next'
import { ExternalLink, Modal, ModalProps, ModalTitle } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'

import { CHAIN_ID } from '@constants/misc'
import { getBridgeUrls } from '@constants/config'

interface BridgeTokensModalProps extends Omit<ModalProps, 'children'> {
  chainId: number
}

export const BridgeTokensModal = (props: BridgeTokensModalProps) => {
  const { chainId } = props

  const { t } = useTranslation()
  const links = getBridgeUrls(chainId)
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

        <p className='text-inverse opacity-60 mt-4 mb-6'>
          {t(
            'checkOutThese',
            'Make use of one of these services to move your tokens to {{networkName}}',
            {
              networkName
            }
          )}
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
      <ExternalLink className='text-xl' href={url}>
        {title}
      </ExternalLink>
    </li>
  )
}

BridgeTokensModal.defaultProps = {
  chainId: CHAIN_ID.mainnet
}
