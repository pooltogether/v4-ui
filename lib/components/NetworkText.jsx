import React, { useContext } from 'react'
import classnames from 'classnames'

import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { chainIdToNetworkName } from 'lib/utils/chainIdToNetworkName'
import { networkTextColorClassname } from 'lib/utils/networkColorClassnames'

import IconNetwork from 'assets/images/icon-network.svg'

export function NetworkText(props) {
  const { openTransactions } = props

  const { supportedNetwork, chainId } = useContext(AuthControllerContext)

  let networkName = null
  if (chainId && supportedNetwork) {
    networkName = chainIdToNetworkName(chainId)
  }

  if (!networkName) {
    return null
  }
  return (
    <>
      <button
        onClick={openTransactions}
        className={classnames(
          'tracking-wide flex items-center capitalize trans trans-fast',
          `bg-default hover:bg-body text-${networkTextColorClassname(
            chainId
          )} hover:text-inverse border border-accent-4 hover:border-primary`,
          'text-xxs sm:text-xs px-2 xs:px-4 rounded-full mr-2 h-8'
        )}
      >
        <img src={IconNetwork} className='w-4 mr-1 xs:mr-2' />
        <span className='capitalize'>
          {networkName.charAt(0)}
          <span className='hidden sm:inline-block lowercase'>
            {networkName.substr(1, networkName.length)}
          </span>
        </span>
      </button>
    </>
  )
}
