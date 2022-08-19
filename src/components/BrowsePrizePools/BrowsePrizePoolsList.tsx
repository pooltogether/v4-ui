import { PrizePoolLabel } from '@components/PrizePoolLabel'
import { usePrizePoolsByTvl } from '@hooks/usePrizePoolsByTvl'
import { PrizePool } from '@pooltogether/v4-client-js'
import { AccountListItem, LoadingAccountListItem } from '@views/Account/AccountList/AccountListItem'
import classNames from 'classnames'

export const BrowsePrizePoolsList: React.FC<{
  className?: string
  onPrizePoolSelect?: (prizePool: PrizePool) => void
}> = (props) => {
  const { className, onPrizePoolSelect } = props
  const { prizePools, isFetched } = usePrizePoolsByTvl()

  return (
    <ul className={classNames('space-y-2 w-full', className)}>
      {!isFetched && (
        <>
          <LoadingAccountListItem />
          <LoadingAccountListItem />
          <LoadingAccountListItem />
        </>
      )}
      {prizePools?.map((prizePool) => (
        <AccountListItem
          key={prizePool.id()}
          onClick={() => onPrizePoolSelect(prizePool)}
          left={<PrizePoolLabel prizePool={prizePool} />}
          right={null}
        />
      ))}
    </ul>
  )
}
