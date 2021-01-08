import { ethers } from 'ethers'

const bn = ethers.utils.bigNumberify

export function determineGasPrice (gasStationQuery) {
  let gasPrice = bn(15100000000)
  const {
    gasStation
  } = gasStationQuery || {}

  if (gasStation) {
    const gasPrices = gasStation.gasPrices

    if (gasPrices.average.gt(15)) {
      gasPrice = gasPrices.averagePlusOne
    } else {
      gasPrice = gasPrices.fastestPlusOne
    }
  }

  return gasPrice
}
