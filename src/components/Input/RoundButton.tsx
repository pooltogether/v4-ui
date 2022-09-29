import FeatherIcon from 'feather-icons-react'

export const RoundButton: React.FC<{ onClick: () => void; icon: string; label?: string }> = (
  props
) => (
  <div className='flex flex-col'>
    <button
      type='button'
      onClick={props.onClick}
      className='h-11 w-11 px-2 py-3 text-xxs rounded-full flex flex-col text-center justify-center trans bg-gradient-magenta hover:bg-opacity-70 mx-auto'
    >
      <FeatherIcon className='mx-auto w-4 h-4 stroke-current stroke-3' icon={props.icon} />
    </button>
    {!!props.label && <div className='text-xxxs mx-auto mt-1'>{props.label}</div>}
  </div>
)
