interface PrizePoolListItemProps {
  left: React.ReactNode
  right: React.ReactNode
  bottom?: React.ReactNode
  onClick: () => void
}

export const PrizePoolDepositListItem = (props: PrizePoolListItemProps) => {
  const { onClick, left, right, bottom } = props
  return (
    <li className='transition bg-white bg-opacity-70 hover:bg-opacity-100 dark:bg-actually-black dark:bg-opacity-10 dark:hover:bg-opacity-20 rounded-lg '>
      <button className='px-4 py-2 w-full flex justify-between items-center' onClick={onClick}>
        {left}
        {right}
      </button>
      {bottom}
    </li>
  )
}
