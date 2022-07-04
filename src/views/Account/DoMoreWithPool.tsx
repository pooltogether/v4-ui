import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'

export const DoMoreWithPool = () => {
  return (
    <div>
      <div className='text-lg font-bold text-center w-full mb-4'>Do more with your $POOL</div>
      <div className='flex justify-evenly'>
        <RoundLink href={''} icon={'dollar-sign'} label={'Earn'} />
        <RoundButton onClick={() => console.log('yah')} icon={'plus'} label={'Vote'} />
        <RoundLink href={''} icon={'refresh-cw'} label={'Swap'} />
      </div>
    </div>
  )
}

const roundClassName =
  'h-11 w-11 px-2 py-3 text-xxs rounded-full flex flex-col text-center justify-center trans bg-gradient-magenta hover:bg-opacity-70'

const RoundLink: React.FC<{ href: string; icon: string; label: string }> = (props) => (
  <div className='flex flex-col'>
    <a type='button' className={roundClassName} href={props.href} rel='noopener noreferrer'>
      <FeatherIcon className='mx-auto w-4 h-4 stroke-current stroke-2' icon={props.icon} />
    </a>
    <div className='text-xxxs mx-auto'>{props.label}</div>
  </div>
)

const RoundButton: React.FC<{ onClick: () => void; icon: string; label: string }> = (props) => (
  <div className='flex flex-col'>
    <button type='button' onClick={props.onClick} className={roundClassName}>
      <FeatherIcon className='mx-auto w-4 h-4 stroke-current stroke-2' icon={props.icon} />
    </button>
    <div className='text-xxxs mx-auto'>{props.label}</div>
  </div>
)
