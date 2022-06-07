import FeatherIcon from 'feather-icons-react'

interface PrizePoolListItemProps {
  left: React.ReactNode
  right: React.ReactNode
  bottom?: React.ReactNode
  onClick: () => void
}

export const PrizePoolListItem = (props: PrizePoolListItemProps) => {
  const { onClick, left, right, bottom } = props
  return (
    <li className='transition bg-white bg-opacity-70 hover:bg-opacity-100 dark:bg-actually-black dark:bg-opacity-10 dark:hover:bg-opacity-20 rounded-lg '>
      <button className='p-4 w-full flex justify-between items-center' onClick={onClick}>
        {left}
        <div className='flex space-x-2 items-center'>
          {right}
          <FeatherIcon icon='chevron-right' className='w-6 h-6 opacity-50' />
        </div>
      </button>
      {bottom}
    </li>
  )
}
