import { ethers } from 'ethers'

export function msToSeconds(ms) {
  if (!ms) {
    return 0
  }
  return ethers.utils.bigNumberify(ms).div(1000)
}
