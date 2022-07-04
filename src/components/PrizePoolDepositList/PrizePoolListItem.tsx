import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'

interface PrizePoolListItemProps {
  left: React.ReactNode
  right: React.ReactNode
  bottom?: React.ReactNode
  bgClassName?: string
  radiusClassName?: string
  onClick: () => void
}

export const PrizePoolListItem = (props: PrizePoolListItemProps) => {
  const { onClick, bgClassName, radiusClassName, left, right, bottom } = props
  return (
    <li className={classNames('transition', bgClassName, radiusClassName)}>
      <button className='py-2 px-4 w-full flex justify-between items-center' onClick={onClick}>
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

PrizePoolListItem.defaultProps = {
  bgClassName:
    'bg-white bg-opacity-0 hover:bg-opacity-10 dark:bg-actually-black dark:bg-opacity-0 dark:hover:bg-opacity-10',
  radiusClassName: 'rounded'
}
