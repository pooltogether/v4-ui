import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'

export const LoadingAccountListItem: React.FC<{ className?: string; bgClassName?: string }> = (
  props
) => {
  const { bgClassName, className, ...listItemProps } = props
  return <li {...listItemProps} className={classNames(className, bgClassName)} />
}

LoadingAccountListItem.defaultProps = {
  bgClassName:
    'bg-white bg-opacity-0 hover:bg-opacity-10 dark:bg-actually-black dark:bg-opacity-0 dark:hover:bg-opacity-10 animate-pulse'
}

export const AccountListItem: React.FC<{
  left: React.ReactNode
  right: React.ReactNode
  bottom?: React.ReactNode
  bgClassName?: string
  radiusClassName?: string
  onClick: () => void
}> = (props) => {
  const { onClick, bgClassName, radiusClassName, left, right, bottom } = props
  return (
    <li className={classNames('transition', bgClassName, radiusClassName)}>
      <button className='py-1 px-2 w-full flex justify-between items-center' onClick={onClick}>
        <div className='text-xs xs:text-sm sm:text-lg font-bold text-left'>{left}</div>
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
  radiusClassName: 'rounded-lg'
}
