import { getExchangeUrl } from '@constants/config'
import { ViewProps } from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'
import FeatherIcon from 'feather-icons-react'

export const SwapTokensModalView: React.FC<
  {
    chainId: number
    tokenAddress: string
  } & ViewProps
> = (props) => {
  const { chainId, tokenAddress } = props

  const { t } = useTranslation()
  const url = getExchangeUrl(chainId, tokenAddress)

  return (
    <>
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
    </>
  )
}
