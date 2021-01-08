import React, { useContext } from 'react'
import classnames from 'classnames'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { chainIdToNetworkName } from 'lib/utils/chainIdToNetworkName'
import { networkTextColorClassname } from 'lib/utils/networkColorClassnames'

export function NetworkText(props) {
  const { openTransactions } = props

  const { supportedNetwork, chainId } = useContext(AuthControllerContext)

  let networkName = null
  if (chainId && supportedNetwork) {
    networkName = chainIdToNetworkName(chainId)
  }

  return <>
    <button
      onClick={openTransactions}
      className={classnames(
        'font-bold tracking-wide flex items-center capitalize trans trans-fast',
        `bg-default hover:bg-body text-${networkTextColorClassname(chainId)} hover:text-inverse border-2 border-accent-4 hover:border-primary`,
        'text-xxs sm:text-xs pl-2 xs:pl-10 pr-2 rounded-full ml-2 xs:-ml-8 h-8',
      )}
    >
      {networkName}
    </button>
  </>
}