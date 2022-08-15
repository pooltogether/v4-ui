import { getBridgeUrls } from '@constants/config'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'react-i18next'
import { ModalTitle, ViewProps } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { CHAIN_ID } from '@pooltogether/wallet-connection'

export const BridgeTokensView: React.FC<{ chainId: number } & ViewProps> = (props) => {
  const { chainId } = props

  const { t } = useTranslation()
  const links = getBridgeUrls(chainId)
  const networkName = getNetworkNiceNameByChainId(chainId)

  // Explore button to go there
  // Submit for valid hook-form moves to confirm view with a TxButton
  return (
    <div>
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
    </div>
  )
}

const BridgeLink = (props: { url: string; title: string }) => {
  const { url, title } = props
  return (
    <li>
      <a
        className='flex text-xl items-center space-x-2 transition hover:opacity-50'
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

BridgeTokensView.defaultProps = {
  chainId: CHAIN_ID.mainnet
}
