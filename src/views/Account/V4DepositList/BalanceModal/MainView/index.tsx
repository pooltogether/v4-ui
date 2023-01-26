import { RoundButton } from '@components/Input/RoundButton'
import { ViewProps } from '@pooltogether/react-components'
import { useTranslation } from 'next-i18next'
import { BalanceHeader } from './BalanceHeader'
import { ViewIds } from '..'

export const MainView: React.FC<{} & ViewProps> = (props) => {
  const { setSelectedViewId } = props
  const { t } = useTranslation()

  return (
    <div className='flex flex-col h-full justify-between'>
      <BalanceHeader key='balance-header' />
      <div className='flex justify-evenly mt-8'>
        <RoundButton
          onClick={() => setSelectedViewId(ViewIds.deposit)}
          icon={'arrow-down'}
          label={t('deposit')}
          iconSizeClassName='w-6 h-6'
        />
        <RoundButton
          onClick={() => setSelectedViewId(ViewIds.withdraw)}
          icon={'arrow-up'}
          label={t('withdraw')}
          iconSizeClassName='w-6 h-6'
        />
        <RoundButton
          onClick={() => setSelectedViewId(ViewIds.delegate)}
          icon={'gift'}
          label={t('delegate')}
          iconSizeClassName='w-6 h-6'
        />
        <RoundButton
          onClick={() => setSelectedViewId(ViewIds.moreInfo)}
          icon={'info'}
          label={t('info')}
          iconSizeClassName='w-6 h-6'
        />
      </div>
    </div>
  )
}
