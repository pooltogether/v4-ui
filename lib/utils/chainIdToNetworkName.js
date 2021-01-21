export function chainIdToNetworkName(chainId) {
  switch (chainId) {
    case 1:
      return 'mainnet'
    case 3:
      return 'ropsten'
    case 4:
      return 'rinkeby'
    case 5:
      return 'goerli'
    case 42:
      return 'kovan'
    case 1234:
      return 'localhost'
    case 31337:
      return 'localhost'
  }

  console.error(`unknown network chainId: ${chainId}`)
  return 'unknown network'
}
