import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useAddNetworkToMetamask } from '@pooltogether/hooks'
import { SquareButton } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'

import { useIsWalletMetamask } from 'lib/hooks/useIsWalletMetamask'

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
        <p className='mb-10'>
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
  const addNetwork = useAddNetworkToMetamask(chainId, { onSuccess })
  const networkName = getNetworkNiceNameByChainId(chainId)

  const isWalletMetamask = useIsWalletMetamask()

  if (!isWalletMetamask) {
    return null
  }

  return (
    <SquareButton onClick={addNetwork}>
      {t('switchToNetwork', { network: networkName })}
    </SquareButton>
  )
}
