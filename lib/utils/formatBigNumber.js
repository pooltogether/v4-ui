import { ethers } from 'ethers'

export const formatBigNumber = (bn, pool) => {
  let formatted = ''

  try {
    const decimals = pool?.underlyingCollateralDecimals

    if (bn && decimals) {
      formatted = ethers.utils.formatUnits(bn, Number(decimals))
    }
  } catch (e) {
    console.warn('Unable to format bigNum: ', bn?.toString(), e.message)
  }

  return formatted
}
