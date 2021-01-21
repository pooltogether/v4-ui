import { ethers } from 'ethers'

export function formatUnitsAsWholeNumber(amount, decimals) {
  return ethers.utils.formatUnits(amount, decimals).split('.')[0]
}
