import React from 'react'
import FeatherIcon from 'feather-icons-react'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { Token } from '@pooltogether/hooks'
import { BigNumber } from 'ethers'

import { toast } from 'react-toastify'
import { Button } from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'

export interface DepositAllowance {
  allowanceUnformatted: BigNumber
  isApproved: boolean
}

interface RevokeAllowanceButtonProps {
  isWalletOnProperNetwork: boolean
  chainId: number
  token: Token
  sendRevokeAllowanceTransaction: () => Promise<string>
}

export const RevokeAllowanceButton = (props: RevokeAllowanceButtonProps) => {
  const { isWalletOnProperNetwork, token, chainId, sendRevokeAllowanceTransaction } = props
  const { t } = useTranslation()

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
