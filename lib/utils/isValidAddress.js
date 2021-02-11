import { ethers } from 'ethers'

export const isValidAddress = (address) => {
  if (!address) return false
  try {
    const checkSummedAddress = ethers.utils.getAddress(address)
    if (checkSummedAddress) return true
    return false
  } catch (e) {
    return false
  }
}
