import { useSendTransaction } from '@hooks/useSendTransaction'
import { Amount } from '@pooltogether/hooks'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { FathomEvent, logEvent } from '@utils/services/fathom'
import { Overrides } from 'ethers'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useGetUser } from '../User/useGetUser'
import { useSelectedPrizePool } from './useSelectedPrizePool'
import { useSelectedPrizePoolTokens } from './useSelectedPrizePoolTokens'
import { useUsersPrizePoolBalances } from './useUsersPrizePoolBalances'
import { useUsersTotalTwab } from './useUsersTotalTwab'

export const useSendWithdrawTransaction = (withdrawAmount: Amount) => {
  const _sendTransaction = useSendTransaction()
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const prizePool = useSelectedPrizePool()
  const getUser = useGetUser(prizePool)
  const { data: tokenData } = useSelectedPrizePoolTokens()

  const { refetch: refetchUsersTotalTwab } = useUsersTotalTwab(usersAddress)
  const { refetch: refetchUsersBalances } = useUsersPrizePoolBalances(usersAddress, prizePool)

  return useCallback(() => {
    const name = `${t('withdraw')} ${withdrawAmount.amountPretty} ${tokenData.token.symbol}`
    const overrides: Overrides = { gasLimit: 750000 }
    const callTransaction = async () => {
      const user = await getUser()
      return user.withdraw(withdrawAmount.amountUnformatted, overrides)
    }

    return _sendTransaction({
      name,
      callTransaction,
      callbacks: {
        onConfirmedByUser: () => logEvent(FathomEvent.withdrawal),
        onSuccess: () => {},
        refetch: () => {
          refetchUsersTotalTwab()
          refetchUsersBalances()
        }
      }
    })
  }, [withdrawAmount, usersAddress, prizePool.id()])
}
