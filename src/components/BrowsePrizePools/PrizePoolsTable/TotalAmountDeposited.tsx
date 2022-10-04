import { TicketTotalSupply } from '@components/PrizePool/TicketTotalSupply'
import { usePrizePoolTokens } from '@pooltogether/hooks'
import { TokenIcon } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'

export const TotalAmountDeposited = (props: { prizePool: PrizePool; className?: string }) => {
  const { data: tokens } = usePrizePoolTokens(props.prizePool)
  return (
    <span className={classNames(props.className)}>
      {/* <TokenIcon
        chainId={props.prizePool.chainId}
        address={tokens?.token.address}
        className={'mr-1 my-auto'}
        sizeClassName={'w-5 h-5 sm:w-4 sm:h-4'}
      /> */}
      <div className='flex flex-col sm:flex-row sm:space-x-1'>
        <span>
          <TicketTotalSupply prizePool={props.prizePool} />
        </span>
        <span>{tokens?.token.symbol}</span>
      </div>
    </span>
  )
}
