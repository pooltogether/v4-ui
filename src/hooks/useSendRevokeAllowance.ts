import { useSendTransaction } from '@hooks/useSendTransaction'
import { Token } from '@pooltogether/hooks'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { buildApproveTx } from '@utils/transactions/buildApproveTx'
import { BigNumber } from 'ethers'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSigner } from 'wagmi'

export const useSendRevokeAllowance = (token: Token, prizePoolAddress: string) => {
  const { t } = useTranslation()
  const { refetch: getSigner } = useSigner()
  const sendTx = useSendTransaction()
  const usersAddress = useUsersAddress()

  return useCallback(async () => {
    const { data: signer } = await getSigner()
    const callTransaction = buildApproveTx(signer, BigNumber.from(0), prizePoolAddress, token)
    const name = t('revokePoolAllowance', { ticker: token.symbol })

    const txId = await sendTx({
      name,
      callTransaction
    })

    return txId
  }, [sendTx, token, prizePoolAddress, usersAddress, t])
}
