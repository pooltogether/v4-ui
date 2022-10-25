import { useSendRevokeAllowance } from '@hooks/useSendRevokeAllowance'
import { Token } from '@pooltogether/hooks'
import { Button } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { useIsWalletOnChainId } from '@pooltogether/wallet-connection'
import { BigNumber } from 'ethers'
import FeatherIcon from 'feather-icons-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

export interface DepositAllowance {
  allowanceUnformatted: BigNumber
  isApproved: boolean
}

export const RevokeAllowanceButton: React.FC<{
  chainId: number
  token: Token
  prizePoolAddress: string
}> = (props) => {
  const { chainId, token, prizePoolAddress } = props
  const isWalletOnProperNetwork = useIsWalletOnChainId(chainId)
  const { t } = useTranslation()

  const sendRevokeAllowanceTransaction = useSendRevokeAllowance(token, prizePoolAddress)

  const handleRevokeAllowanceClick = async () => {
    if (!isWalletOnProperNetwork) {
      toast.warn(
        t('switchToNetworkToRevokeToken', {
          networkName: getNetworkNiceNameByChainId(chainId),
          token: token.symbol
        })
      )
      return null
    }

    sendRevokeAllowanceTransaction()
  }

  return (
    <Button
      disabled={!isWalletOnProperNetwork}
      onClick={handleRevokeAllowanceClick}
      className='flex w-full items-center justify-center'
    >
      <FeatherIcon icon='minus-circle' className='w-5 mr-1' />
      {t(`revokePoolAllowance`, { ticker: token.symbol })}
    </Button>
  )
}
