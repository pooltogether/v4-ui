import classNames from 'classnames'

export const PrizePoolDepositListItem: React.FC<{
  left: React.ReactNode
  right: React.ReactNode
  bottom?: React.ReactNode
  onClick?: () => void
}> = (props) => {
  const { onClick, left, right, bottom } = props
  return (
    <li
      className={classNames(
        'transition bg-white bg-opacity-70 dark:bg-actually-black dark:bg-opacity-10 rounded-lg',
        {
          'hover:bg-opacity-100 dark:hover:bg-opacity-20': !!onClick
        }
      )}
    >
      <button className='px-4 py-2 w-full flex justify-between items-center' onClick={onClick}>
        {left}
        {right}
      </button>
      {bottom}
    </li>
  )
}
