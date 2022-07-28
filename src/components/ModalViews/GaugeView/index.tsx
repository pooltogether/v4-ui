import { RoundButton } from '@components/Input/RoundButton'
import { ViewProps } from '@pooltogether/react-components'
import { GaugeHeader } from './GaugeHeader'

export const GaugeView: React.FC<
  {
    onStakeClick: () => void
    onUnstakeClick: () => void
    onInfoClick: () => void
  } & ViewProps
> = (props) => {
  const { onStakeClick, onUnstakeClick, onInfoClick } = props
  return (
    <div className='flex flex-col justify-between space-y-8'>
      <GaugeHeader />
      <div className='flex justify-evenly'>
        <RoundButton onClick={onStakeClick} icon={'arrow-down'} label={'Stake'} />
        <RoundButton onClick={onUnstakeClick} icon={'arrow-up'} label={'Unstake'} />
        <RoundButton onClick={onInfoClick} icon={'info'} label={'Info'} />
      </div>
    </div>
  )
}
