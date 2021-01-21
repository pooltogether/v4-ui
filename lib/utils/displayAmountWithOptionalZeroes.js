import { ethers } from 'ethers'

import { displayAmountInEther } from 'lib/utils/displayAmountInEther'

const ONE_ETHER = ethers.constants.WeiPerEther

export function displayAmountWithOptionalZeroes(amount, options = {}) {
  let newPrecision = 2

  let totalPossibleDecimalPlaces = 2
  if (options.totalPossibleDecimalPlaces !== undefined) {
    totalPossibleDecimalPlaces = options.totalPossibleDecimalPlaces
  }

  if (amount.lt(ONE_ETHER.div(10000))) {
    newPrecision = 5
  } else if (amount.lt(ONE_ETHER.div(1000))) {
    newPrecision = 4
  } else if (amount.lt(ONE_ETHER.div(100))) {
    newPrecision = 3
  } else if (amount.lt(ONE_ETHER.div(10))) {
    newPrecision = 2
  } else if (amount.lt(ONE_ETHER)) {
    newPrecision = 1
  }

  if (newPrecision > totalPossibleDecimalPlaces) {
    newPrecision = totalPossibleDecimalPlaces
  }

  return displayAmountInEther(amount, {
    ...options,
    precision: newPrecision,
  })
}
