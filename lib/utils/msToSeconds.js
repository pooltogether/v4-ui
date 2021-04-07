import { ethers } from 'ethers'

export function msToSeconds(ms) {
  if (!ms) {
    return 0
  }
  return ethers.BigNumber.from(ms).div(1000)
}
