import { usePrizePoolContractAddresses } from 'lib/hooks/usePrizePoolContractAddresses'

export const useTokenFaucetAddresses = () => {
  const { data: pools, ...remainingUseQueryData } = usePrizePoolContractAddresses()

  const tokenFaucets = []
  if (pools) {
    Object.keys(pools).forEach((prizePoolAddress) =>
      tokenFaucets.push(pools[prizePoolAddress].tokenFaucet)
    )
  }

  return {
    ...remainingUseQueryData,
    data: tokenFaucets
  }
}
