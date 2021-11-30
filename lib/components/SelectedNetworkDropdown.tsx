import React from 'react'
import classnames from 'classnames'
import { DropdownList, NetworkIcon } from '@pooltogether/react-components'
import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'

import { SUPPORTED_NETWORKS } from 'lib/constants/config'
import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'

interface SelectedNetworkDropdownProps {
  className?: string
}

export const SelectedNetworkDropdown = (props: SelectedNetworkDropdownProps) => {
  const { className } = props

  const appEnv = getStoredIsTestnetsCookie() ? APP_ENVIRONMENTS.testnets : APP_ENVIRONMENTS.mainnets

  const supportedNetworks = SUPPORTED_NETWORKS[appEnv]

  const { chainId, setSelectedChainId } = useSelectedNetwork()

  const formatValue = (chainId) => {
    return (
      <span className='flex items-center capitalize leading-none py-2 tracking-wider'>
        <NetworkIcon chainId={chainId} className='mx-1' sizeClassName='w-4 h-4' />{' '}
        {getNetworkNiceNameByChainId(chainId)}
      </span>
    )
  }

  const changeNetwork = (value) => {
    setSelectedChainId(value)
  }

  return (
    <DropdownList
      id='tsunami-dropdown'
      className={classnames(
        className,
        'font-inter transition border border-accent-4 hover:border-default rounded-lg',
        'px-3 flex flex-row text-xs xs:text-sm hover:text-inverse bg-tertiary'
      )}
      label={''}
      formatValue={formatValue}
      onValueSet={changeNetwork}
      current={chainId}
      values={supportedNetworks}
    />
  )
}
