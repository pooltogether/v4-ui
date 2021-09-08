import { ethers } from 'ethers'
import { getUsdAmount } from 'lib/components/Prizes/PrizesUI'
import { useUsersClaimablePrizes } from 'lib/hooks/useUsersClaimablePrizes'
import { usePrizePoolTokensWithUsd } from 'lib/hooks/usePrizePoolTokensWithUsd'

export const useTotalClaimableUsdAmount = () => {
  const { data: tokens, isFetched: isTokensFetched } = usePrizePoolTokensWithUsd()
  const { data: claimablePrizesData, isFetched: isAllClaimablePrizesFetched } =
    useUsersClaimablePrizes()

  if (!isAllClaimablePrizesFetched || !isTokensFetched) {
    return {
      data: null,
      isFetched: false
    }
  }

  const { claimablePrizes } = claimablePrizesData
  const amountUnformatted = claimablePrizes.reduce(
    (claimableAmount, prize) => claimableAmount.add(prize.amountUnformatted),
    ethers.constants.Zero
  )
  const amount = ethers.utils.formatUnits(amountUnformatted, tokens.underlyingToken.decimals)
  const usd = getUsdAmount(amountUnformatted, tokens.ticket)

  const data = {
    amountUnformatted,
    amount,
    usd
  }

  return {
    data,
    isFetched: true
  }
}
