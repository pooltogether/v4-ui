import React from 'react'
import classnames from 'classnames'
import { DropdownList, NetworkIcon } from '@pooltogether/react-components'
import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { NETWORK, getNetworkNiceNameByChainId } from '@pooltogether/utilities'

import { SUPPORTED_NETWORKS } from 'lib/constants/supportedNetworks'
import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'

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

  const [selectedChainId, setSelectedNetwork] = useSelectedNetwork()

  const formatValue = (chainId) => {
    return (
      <span className='flex items-center capitalize leading-none py-2 tracking-wider'>
        <NetworkIcon chainId={chainId} className='mx-1' sizeClassName='w-4 h-4' />{' '}
        {getNetworkNiceNameByChainId(chainId)}
      </span>
    )
  }

  const changeNetwork = (value) => {
    setSelectedNetwork(value)
  }

  return (
    <DropdownList
      id='selected-network-dropdown'
      className={classnames(
        className,
        'font-inter transition border border-accent-4 hover:border-default rounded-lg',
        'px-3 flex flex-row text-xs xs:text-sm hover:text-inverse bg-tertiary'
      )}
      label={''}
      formatValue={formatValue}
      onValueSet={changeNetwork}
      current={selectedChainId}
      values={supportedNetworks}
    />
  )
}
