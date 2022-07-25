import { RoundButton } from '@components/Input/RoundButton'
import { ViewProps } from '@pooltogether/react-components'
import { ViewIds } from '..'
import { BalanceHeader } from './BalanceHeader'

export const MainView: React.FC<{} & ViewProps> = (props) => {
  const { setSelectedViewId } = props
  return (
    <div className='flex flex-col justify-between space-y-8'>
      <BalanceHeader />
      <div className='flex justify-evenly'>
        <RoundButton
          onClick={() => setSelectedViewId(ViewIds.deposit)}
          icon={'arrow-up'}
          label={'Deposit'}
        />
        <RoundButton
          onClick={() => setSelectedViewId(ViewIds.withdraw)}
          icon={'arrow-down'}
          label={'Withdraw'}
        />
        <RoundButton
          onClick={() => setSelectedViewId(ViewIds.moreInfo)}
          icon={'info'}
          label={'Info'}
        />
      </div>
    </div>
  )
}
