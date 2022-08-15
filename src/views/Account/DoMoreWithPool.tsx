import { RoundButton } from '@components/Input/RoundButton'
import FeatherIcon from 'feather-icons-react'
import { useState } from 'react'

export const DoMoreWithPool = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div>
        <div className='text-lg font-bold text-center w-full mb-4'>Do more with your $POOL</div>
        <div className='flex justify-evenly sm:justify-between sm:px-8 max-w-sm mx-auto'>
          <RoundButton onClick={() => setIsOpen(true)} icon={'dollar-sign'} label={'Earn'} />
          <RoundLink href={'https://vote.pooltogether.com'} icon={'plus'} label={'Vote'} />
          <RoundLink href={''} icon={'refresh-cw'} label={'Swap'} />
        </div>
      </div>
    </>
  )
}

const roundClassName =
  'h-11 w-11 px-2 py-3 text-xxs rounded-full flex flex-col text-center justify-center trans bg-gradient-magenta hover:bg-opacity-70'

const RoundLink: React.FC<{ href: string; icon: string; label: string }> = (props) => (
  <div className='flex flex-col'>
    <a type='button' className={roundClassName} href={props.href} rel='noopener noreferrer'>
      <FeatherIcon className='mx-auto w-4 h-4 stroke-current stroke-2' icon={props.icon} />
    </a>
    <div className='text-xxxs mx-auto mt-1 opacity-70'>{props.label}</div>
  </div>
)
