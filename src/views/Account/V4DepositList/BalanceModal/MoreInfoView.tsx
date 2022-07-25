import { getBridgeUrls } from '@constants/config'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'react-i18next'
import { ModalTitle, ViewProps } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { CHAIN_ID } from '@pooltogether/wallet-connection'

export const MoreInfoView: React.FC<{ chainId: number } & ViewProps> = (props) => {
  const { chainId } = props
  const { t } = useTranslation()

  return (
    <div>
      <div className='flex flex-col'>
        <ModalTitle chainId={chainId} title={'More info'} />
      </div>
    </div>
  )
}
