import { ethers } from 'ethers'

export function secondsToMs(timestamp) {
  if (!timestamp) {
    return 0
  }
  if (timestamp instanceof Date) {
    return timestamp
  } else {
    return ethers.BigNumber.from(timestamp).mul(1000)
  }
}
