import { ethers } from 'ethers'

export const useClaimableDraws = () => {
  return {
    isFetched: true,
    data: {
      3: {
        id: 3,
        totalAwardAmount: ethers.BigNumber.from('100000000000000000000000'),
        winningRandomNumber: ethers.constants.One,
        timestamp: 1630072865
      },
      2: {
        id: 2,
        totalAwardAmount: ethers.BigNumber.from('100000000000000000000000'),
        winningRandomNumber: ethers.constants.One,
        timestamp: 1629468065
      },
      1: {
        id: 1,
        totalAwardAmount: ethers.BigNumber.from('100000000000000000000000'),
        winningRandomNumber: ethers.constants.One,
        timestamp: 1628863265
      },
      0: {
        id: 0,
        totalAwardAmount: ethers.BigNumber.from('100000000000000000000000'),
        winningRandomNumber: ethers.constants.One,
        timestamp: 1628258465
      }
    }
  }
}
