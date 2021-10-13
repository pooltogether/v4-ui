import React from 'react'
import classnames from 'classnames'
import { DropdownList, NetworkIcon } from '@pooltogether/react-components'
import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { NETWORK, getNetworkNiceNameByChainId } from '@pooltogether/utilities'

import { DEFAULT_NETWORKS, SUPPORTED_NETWORKS } from 'lib/constants/supportedNetworks'
import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'
import { useSupportedNetworks } from 'lib/hooks/useSupportedNetworks'

interface SelectedNetworkDropdownProps {
  className?: string
}

const NETWORKS = {
  [NETWORK.mainnet]: {
    name: 'Mainnet',
    nativeName: 'Mainnet'
  },
  [NETWORK.rinkeby]: {
    name: 'Rinkeby',
    nativeName: 'Rinkeby'
  },
  [NETWORK.polygon]: {
    name: 'Polygon',
    nativeName: 'Polygon'
  },
  [NETWORK.mumbai]: {
    name: 'Mumbai',
    nativeName: 'Mumbai'
  }
}

export const SelectedNetworkDropdown = (props: SelectedNetworkDropdownProps) => {
  const { className } = props

  const appEnv = getStoredIsTestnetsCookie() ? APP_ENVIRONMENTS.testnets : APP_ENVIRONMENTS.mainnets

  const supportedNetworks = SUPPORTED_NETWORKS[appEnv]
  // const defaultNetwork = DEFAULT_NETWORKS[appEnv]

  // const supportedNetworks = useSupportedNetworks()
  console.log({ supportedNetworks })
  const [selectedChainId, setSelectedNetwork] = useSelectedNetwork()

  const formatValue = (chainId) => {
    return <span className='capitalize'>{getNetworkNiceNameByChainId(chainId)}</span>
  }

  const changeNetwork = (value) => {
    setSelectedNetwork(value)
  }

  // <NetworkIcon chainId={chainId} className='my-auto mr-1' sizeClassName='w-4 h-4' />
  // <span className={classnames({ 'text-white opacity-70 hover:opacity-100': !isSelected })}>
  //   {getNetworkNiceNameByChainId(chainId)}
  // </span>

  return (
    <DropdownList
      id='selected-network-dropdown'
      className={classnames(
        className,
        'transition mx-1 first:ml-0 last:mr-0 rounded-lg px-3 flex flex-row',
        'text-xs hover:text-white active:bg-highlight-9'
        // { 'bg-highlight-9 text-white': isSelected },
        // { 'hover:bg-tertiary': !isSelected }
      )}
      label={''}
      formatValue={formatValue}
      onValueSet={changeNetwork}
      current={selectedChainId}
      values={supportedNetworks}
    />
  )
}

// classnames('text-xxs sm:text-sm', className)
