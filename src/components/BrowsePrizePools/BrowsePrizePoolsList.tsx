import { PrizePoolLabel } from '@components/PrizePoolLabel'
import { usePrizePools } from '@hooks/v4/PrizePool/usePrizePools'
import { PrizePool } from '@pooltogether/v4-client-js'
import { AccountListItem } from '@views/Account/AccountList/AccountListItem'
import classNames from 'classnames'

export const BrowsePrizePoolsList: React.FC<{
  className?: string
  selectPrizePool?: (prizePool: PrizePool) => void
}> = (props) => {
  const { className, selectPrizePool } = props
  const prizePools = usePrizePools()

  return (
    <ul className={classNames('space-y-2 w-full', className)}>
      {prizePools.map((prizePool) => (
        <AccountListItem
          key={prizePool.id()}
          onClick={() => selectPrizePool?.(prizePool)}
          left={<PrizePoolLabel prizePool={prizePool} />}
          right={null}
        />
      ))}
    </ul>
  )
}
