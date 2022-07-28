import { useTranslation } from 'react-i18next'
import { ModalTitle, ViewProps } from '@pooltogether/react-components'

export const PrizePoolInfoView: React.FC<{ chainId: number } & ViewProps> = (props) => {
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
