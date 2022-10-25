import { DepositToken } from '@components/PrizePool/DepositToken'
import { useMinimumDepositAmount } from '@hooks/v4/PrizePool/useMinimumDepositAmount'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'

/**
 * NOTE: This is only kinda Prize Pool specific. We have been keeping the Prize Distributions consistent across the Network. If that changes then we need to update this.
 * @returns
 */
export const MinimumDeposit = () => {
  const prizePool = useSelectedPrizePool()
  const amount = useMinimumDepositAmount(prizePool)
  if (!amount) return null
  return (
    <>
      {amount?.amountPretty} <DepositToken prizePool={prizePool} />
    </>
  )
}
