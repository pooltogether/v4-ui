import { ethers } from 'ethers'
import { Draw } from 'lib/types/TsunamiTypes'

export const useLatestDraw = () => {
  return {
    data: {
      id: 3,
      totalAwardAmount: ethers.BigNumber.from('100000000000000000000000'),
      winningRandomNumber: ethers.constants.One,
      timestamp: 1630072865
    } as Draw,
    isFetched: true
  }
}
