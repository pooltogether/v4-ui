import { Button } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import { useSwitchNetwork } from 'wagmi'

interface ModalNetworkGateProps {
  className?: string
  onSuccess?: () => void
  chainId: number
}

export const ModalNetworkGate = (props: ModalNetworkGateProps) => {
  const { className, chainId, onSuccess } = props

  const { t } = useTranslation()

  const networkName = getNetworkNiceNameByChainId(chainId)

  return (
    <div className={classNames(className, 'flex flex-col text-inverse')}>
      <div className='mx-4 opacity-70'>
        <p className='mb-4'>
          {t(
            'thePrizePoolLivesOnTheNetwork',
            'The Prize Pool you are intertacting with lives on the {{networkName}} network.',
            { networkName }
          )}
        </p>
        <p className='mb-4'>
          {t(
            'toContinueYouMustSwitchNetwork',
            'To continue you must switch the network your wallet is on to {{networkName}}, or connect another wallet.',
            { networkName }
          )}
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

  const { t } = useTranslation()
  const networkName = getNetworkNiceNameByChainId(chainId)
  const { switchNetwork } = useSwitchNetwork({ onSuccess })

  return (
    <Button onClick={() => switchNetwork(chainId)}>
      {t('switchToNetwork', { network: networkName })}
    </Button>
  )
}
