import { RoundButton } from '@components/Input/RoundButton'
import { ViewProps } from '@pooltogether/react-components'
import { ViewIds } from '..'
import { BalanceHeader } from './BalanceHeader'

export const MainView: React.FC<{} & ViewProps> = (props) => {
  const { setSelectedViewId } = props

  return (
    <div className='flex flex-col h-full justify-between'>
      <BalanceHeader key='balance-header' />
      <div className='flex justify-evenly mt-8'>
        <RoundButton
          onClick={() => setSelectedViewId(ViewIds.deposit)}
          icon={'arrow-down'}
          label={'Deposit'}
          iconSizeClassName='w-6 h-6'
        />
        <RoundButton
          onClick={() => setSelectedViewId(ViewIds.withdraw)}
          icon={'arrow-up'}
          label={'Withdraw'}
          iconSizeClassName='w-6 h-6'
        />
        <RoundButton
          onClick={() => setSelectedViewId(ViewIds.delegate)}
          icon={'gift'}
          label={'Delegate'}
          iconSizeClassName='w-6 h-6'
        />
        <RoundButton
          onClick={() => setSelectedViewId(ViewIds.moreInfo)}
          icon={'info'}
          label={'Info'}
          iconSizeClassName='w-6 h-6'
        />
      </div>
    </div>
  )
}
