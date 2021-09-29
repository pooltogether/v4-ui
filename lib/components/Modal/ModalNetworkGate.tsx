import { useAddNetworkToMetamask } from '@pooltogether/hooks'
import { SquareButton } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import classNames from 'classnames'
import { useIsWalletMetamask } from 'lib/hooks/useIsWalletMetamask'

interface ModalNetworkGateProps {
  className?: string
  onSuccess?: () => void
  chainId: number
}

export const ModalNetworkGate = (props: ModalNetworkGateProps) => {
  const { className, chainId, onSuccess } = props

  return (
    <div className={classNames(className, 'flex flex-col text-accent-1')}>
      <div className='mx-4'>
        <p className='mb-4'>
          The Prize Pool you are intertacting with lives on the Polygon network.
        </p>
        <p className='mb-10'>
          To continue you must switch the network your wallet is on to Polygon, or connect another
          wallet.
        </p>
      </div>
      <NetworkSwitchButton chainId={chainId} onSuccess={onSuccess} />
    </div>
  )
}

interface NetworkSwitchButtonProps {
  chainId: number
  onSuccess?: () => void
}

const NetworkSwitchButton = (props: NetworkSwitchButtonProps) => {
  const { chainId, onSuccess } = props
  const addNetwork = useAddNetworkToMetamask(chainId, { onSuccess })
  const networkName = getNetworkNiceNameByChainId(chainId)
  const isWalletMetamask = useIsWalletMetamask()

  if (!isWalletMetamask) {
    return null
  }

  return <SquareButton onClick={addNetwork}>Switch to {networkName}</SquareButton>
}
