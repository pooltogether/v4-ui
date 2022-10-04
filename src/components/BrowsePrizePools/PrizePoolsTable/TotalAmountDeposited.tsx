import { TicketTotalSupply } from '@components/PrizePool/TicketTotalSupply'
import { usePrizePoolTokens } from '@pooltogether/hooks'
import { TokenIcon } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'

export const TotalAmountDeposited = (props: { prizePool: PrizePool; className?: string }) => {
  const { data: tokens } = usePrizePoolTokens(props.prizePool)
  return (
    <span className={classNames(props.className)}>
      <TokenIcon
        chainId={props.prizePool.chainId}
        address={tokens?.ticket.address}
        className={'mr-1 my-auto'}
        sizeClassName={'w-4 h-4'}
      />
      <TicketTotalSupply prizePool={props.prizePool} /> {tokens?.token.symbol}
    </span>
  )
}
