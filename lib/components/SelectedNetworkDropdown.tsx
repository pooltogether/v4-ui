import React from 'react'
import classnames from 'classnames'
import { DropdownList, NetworkIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'

import { DEFAULT_NETWORKS, SUPPORTED_NETWORKS } from 'lib/constants/supportedNetworks'
import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'
import { useSupportedNetworks } from 'lib/hooks/useSupportedNetworks'

interface SelectedNetworkDropdownProps {
  className?: string
}

const NETWORKS = {
  '1': {
    name: 'Mainnet',
    nativeName: 'Mainnet'
  },
  '4': {
    name: 'Rinkeby',
    nativeName: 'Rinkeby'
  },
  '137': {
    name: 'Polygon',
    nativeName: 'Polygon'
  },
  '80001': {
    name: 'Mumbai',
    nativeName: 'Mumbai'
  }
}

export const SelectedNetworkDropdown = (props: SelectedNetworkDropdownProps) => {
  const { className } = props

  console.log({ DEFAULT_NETWORKS })
  console.log({ SUPPORTED_NETWORKS })

  const supportedNetworks = useSupportedNetworks()
  console.log({ supportedNetworks })
  const [selectedChainId, setSelectedNetwork] = useSelectedNetwork()

  const formatValue = (key) => {
    console.log({ key })
    const network = NETWORKS[key.toString()]

    return (
      <>
        {key.toString().toUpperCase()} -{' '}
        <span className='capitalize'>{network.nativeName.split(',')[0]}</span> (
        {network.name.split(';')[0]})
      </>
    )
  }

  const changeNetwork = (a, b) => {
    console.log('changeNetwork')
    console.log(a, b)
  }

  return (
    <DropdownList
      id='selected-network-dropdown'
      className={classnames('text-xxs sm:text-sm', className)}
      label={''}
      formatValue={formatValue}
      onValueSet={changeNetwork}
      current={selectedChainId}
      values={NETWORKS}
    />
  )

  // return (
  //   <div
  //     className={classnames(
  //       className,
  //       'flex flex-row rounded-xl bg-pt-purple-bright p-1 max-w-max'
  //     )}
  //   >
  //     {supportedNetworks.map((chainId) => (
  //       <NetworkToggle
  //         key={chainId}
  //         chainId={chainId}
  //         isSelected={chainId === selectedChainId}
  //         setSelectedNetwork={setSelectedNetwork}
  //       />
  //     ))}
  //   </div>
  // )
}

interface NetworkToggleProps {
  chainId: number
  isSelected: boolean
  setSelectedNetwork: (chainId: number) => void
}

const NetworkToggle = (props: NetworkToggleProps) => {
  const { chainId, setSelectedNetwork, isSelected } = props

  return (
    <button
      className={classnames(
        'transition mx-1 first:ml-0 last:mr-0 rounded-lg px-3 flex flex-row',
        'text-xs hover:text-white active:bg-highlight-9',
        { 'bg-highlight-9 text-white': isSelected },
        { 'hover:bg-tertiary': !isSelected }
      )}
      onClick={() => setSelectedNetwork(chainId)}
    >
      <NetworkIcon chainId={chainId} className='my-auto mr-1' sizeClassName='w-4 h-4' />
      <span className={classnames({ 'text-white opacity-70 hover:opacity-100': !isSelected })}>
        {getNetworkNiceNameByChainId(chainId)}
      </span>
    </button>
  )
}
