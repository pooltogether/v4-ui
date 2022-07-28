import { useTranslation } from 'react-i18next'
import { ModalTitle, ViewProps } from '@pooltogether/react-components'

export const GaugeInfoView: React.FC<ViewProps> = (props) => {
  const { t } = useTranslation()

  return (
    <div>
      <div className='flex flex-col'>More info</div>
    </div>
  )
}
