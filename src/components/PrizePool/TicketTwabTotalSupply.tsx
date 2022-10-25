import { usePrizePoolTicketTwabTotalSupply } from '@hooks/v4/PrizePool/usePrizePoolTicketTwabTotalSupply'
import { usePrizePoolTokens } from '@pooltogether/hooks'
import { TokenIcon } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'

/**
 * @param props
 * @returns
 */
export const TicketTwabTotalSupply = (props: {
  prizePool: PrizePool
  showToken?: boolean
  showTokenIcon?: boolean
  iconSizeClassName?: string
  iconClassName?: string
}) => {
  const { prizePool, showToken, showTokenIcon, iconSizeClassName, iconClassName } = props
  const { data } = usePrizePoolTicketTwabTotalSupply(prizePool)
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
      {data?.amount.amountPretty}
      {showToken && <> {tokens?.ticket.symbol}</>}
    </>
  )
}

TicketTwabTotalSupply.defaultProps = {
  iconClassName: 'mr-1 my-auto',
  iconSizeClassName: 'w-4 h-4'
}
