import { TosDisclaimer } from '@components/Layout/FullWalletConnectionButtonWrapper'
import { ViewProps } from '@pooltogether/react-components'
import { WalletConnectionModalContent } from '@pooltogether/wallet-connection'
import { useTranslation } from 'react-i18next'

export const WalletConnectionModalView: React.FC<{} & ViewProps> = (props) => {
  const { onWalletConnected } = props
  const { t } = useTranslation()

  return (
    <WalletConnectionModalContent
      t={t}
      TosDisclaimer={<TosDisclaimer />}
      onWalletConnected={onWalletConnected}
    />
  )
}
