export const getSymbolForMetaMask = (networkName, pool) => {
  if (!pool.symbol) {
    return ''
  }

  const isTestnet = networkName === 'ropsten' || networkName === 'rinkeby'

  let symbol = pool.symbol
    .replace('-', '')
    .replace('T', '')
    .substring(0, isTestnet ? 3 : 5)

  if (isTestnet) {
    symbol = `${symbol}${networkName.substring(0, 1)?.toUpperCase()}${networkName.substring(1, 2)}`
  }

  return symbol
}
