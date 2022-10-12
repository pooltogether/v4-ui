import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import { PrizePoolCard, PrizePoolCardLoader } from '../../PrizePool/PrizePoolCard'

const AMOUNT_OPTIONS = Object.freeze(['10', '100', '1000', '10000'])

export const TopPool = (props: {
  isFetched: boolean
  prizePool: PrizePool
  title: React.ReactNode
  secondaryTitle?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  className?: string
  onClick?: (prizePool: PrizePool) => void
}) => {
  const { isFetched, prizePool, title, secondaryTitle, description, children, className, onClick } =
    props

  return (
    <div className={classNames(className)}>
      <div>
        <div className='flex justify-between space-x-2 items-center'>
          <span className='font-bold text-lg'>{title}</span>
          {secondaryTitle && <div>{secondaryTitle}</div>}
        </div>
        {description && <span className='opacity-75 text-xs mt-1'>{description}</span>}
      </div>
      {isFetched ? (
        <PrizePoolCard prizePool={prizePool} onClick={onClick} className='w-full mt-4'>
          {children}
        </PrizePoolCard>
      ) : (
        <PrizePoolCardLoader className='w-full mt-2' />
      )}
    </div>
  )
}
