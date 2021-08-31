import { ethers } from 'ethers'
import { ClaimablePickPrize } from 'lib/types/TsunamiTypes'

/**
 * TODO: Fetch all prizes for all active draws.
 * Fetch claimed events.
 * Filter draws that were fully claimed.
 */
export const useUsersClaimablePrizes = () => {
  const claimablePrizes = [
    {
      amountUnformatted: ethers.BigNumber.from('10000000000000000000000'),
      distributionIndex: 0,
      drawId: 3,
      pickIndex: 1
    },
    {
      amountUnformatted: ethers.BigNumber.from('5000000000000000000'),
      distributionIndex: 2,
      drawId: 2,
      pickIndex: 13
    },
    {
      amountUnformatted: ethers.BigNumber.from('10000000000000000000'),
      distributionIndex: 1,
      drawId: 2,
      pickIndex: 1
    },
    {
      amountUnformatted: ethers.BigNumber.from('5000000000000000000'),
      distributionIndex: 2,
      drawId: 1,
      pickIndex: 4
    },
    {
      amountUnformatted: ethers.BigNumber.from('5000000000000000000'),
      distributionIndex: 2,
      drawId: 0,
      pickIndex: 4
    }
  ] as ClaimablePickPrize[]

  const totalAmountUnformatted = claimablePrizes.reduce(
    (sum, prize) => sum.add(prize.amountUnformatted),
    ethers.constants.Zero
  )

  return {
    data: {
      claimablePrizes,
      totalAmountUnformatted
    },
    isFetched: true
  }
}
