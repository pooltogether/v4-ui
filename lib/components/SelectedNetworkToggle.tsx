import { NetworkIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import classNames from 'classnames'
import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'
import { useSupportedNetworks } from 'lib/hooks/useSupportedNetworks'
import { useMemo } from 'react'

interface SelectedNetworkToggleProps {
  className?: string
}

export const SelectedNetworkToggle = (props: SelectedNetworkToggleProps) => {
  const { className } = props
  const supportedNetworks = useSupportedNetworks()
  const [selectedChainId, setSelectedNetwork] = useSelectedNetwork()

  return (
    <div className={classNames(className, 'flex flex-row rounded-xl bg-body p-1 max-w-max')}>
      {supportedNetworks.map((chainId) => (
        <NetworkToggle
          key={chainId}
          chainId={chainId}
          isSelected={chainId === selectedChainId}
          setSelectedNetwork={setSelectedNetwork}
        />
      ))}
    </div>
  )
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
      className={classNames(
        'transition mx-1 first:ml-0 last:mr-0 rounded-lg px-2 flex flex-row hover:bg-light-purple-10 active:bg-tertiary',
        { 'bg-tertiary': isSelected }
      )}
      onClick={() => setSelectedNetwork(chainId)}
    >
      <NetworkIcon chainId={chainId} className='my-auto mr-2' sizeClassName='w-4 h-4' />
      <span>{getNetworkNiceNameByChainId(chainId)}</span>
    </button>
  )
}
