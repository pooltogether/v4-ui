import { usePrizePoolTicketTotalSupply } from '@hooks/v4/TwabRewards/usePrizePoolTicketTotalSupply'
import { usePrizePoolTokens } from '@pooltogether/hooks'
import { TokenIcon } from '@pooltogether/react-components'
import { formatNumberForDisplay } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'

/**
 * @param props
 * @returns
 */
export const TicketTotalSupply = (props: {
  prizePool: PrizePool
  showToken?: boolean
  showTokenIcon?: boolean
  iconSizeClassName?: string
  iconClassName?: string
}) => {
  const { prizePool, showToken, showTokenIcon, iconSizeClassName, iconClassName } = props
  const { data, isFetched, isError } = usePrizePoolTicketTotalSupply(prizePool)
  const { data: tokens } = usePrizePoolTokens(prizePool)

  return (
    <>
      {showTokenIcon && (
        <>
          <TokenIcon
            chainId={prizePool.chainId}
            address={tokens?.ticket.address}
            className={iconClassName}
            sizeClassName={iconSizeClassName}
          />
        </>
      )}
      {isFetched &&
        !isError &&
        formatNumberForDisplay(data?.amount.amount, {
          notation: 'compact'
        })}
      {showToken && <> {tokens?.ticket.symbol}</>}
    </>
  )
}

TicketTotalSupply.defaultProps = {
  iconClassName: 'mr-1 my-auto',
  iconSizeClassName: 'w-4 h-4'
}
