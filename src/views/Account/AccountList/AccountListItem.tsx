import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'

interface AccountListItemProps {
  left: React.ReactNode
  right: React.ReactNode
  bottom?: React.ReactNode
  bgClassName?: string
  radiusClassName?: string
  onClick: () => void
}

export const AccountListItem = (props: AccountListItemProps) => {
  const { onClick, bgClassName, radiusClassName, left, right, bottom } = props
  return (
    <li className={classNames('transition', bgClassName, radiusClassName)}>
      <button className='p-1 w-full flex justify-between items-center' onClick={onClick}>
        <div className='text-sm xs:text-lg font-bold text-left'>{left}</div>
        <div className='flex space-x-2 items-center'>
          {right}
          <FeatherIcon icon='chevron-right' className='w-6 h-6 opacity-50' />
        </div>
      </button>
      {bottom}
    </li>
  )
}

AccountListItem.defaultProps = {
  bgClassName:
    'bg-white bg-opacity-0 hover:bg-opacity-10 dark:bg-actually-black dark:bg-opacity-0 dark:hover:bg-opacity-10',
  radiusClassName: 'rounded'
}
