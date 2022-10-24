import { useSendTransaction } from '@hooks/useSendTransaction'
import { Amount } from '@pooltogether/hooks'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { FathomEvent, logEvent } from '@utils/services/fathom'
import { ethers, Overrides } from 'ethers'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetUser } from '../User/useGetUser'
import { useSelectedPrizePool } from './useSelectedPrizePool'
import { useSelectedPrizePoolTokens } from './useSelectedPrizePoolTokens'
import { useUsersPrizePoolBalancesWithFiat } from './useUsersPrizePoolBalancesWithFiat'
import { useUsersTicketDelegate } from './useUsersTicketDelegate'
import { useUsersTotalTwab } from './useUsersTotalTwab'

export const useSendDepositTransaction = (depositAmount: Amount) => {
  const _sendTransaction = useSendTransaction()
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const prizePool = useSelectedPrizePool()
  const getUser = useGetUser(prizePool)
  const { data: tokenData } = useSelectedPrizePoolTokens()
  const { data: delegateData, refetch: refetchTicketDelegate } = useUsersTicketDelegate(
    usersAddress,
    prizePool
  )
  const { refetch: refetchUsersTotalTwab } = useUsersTotalTwab(usersAddress)
  const { refetch: refetchUsersBalances } = useUsersPrizePoolBalancesWithFiat(
    usersAddress,
    prizePool
  )

  return useCallback(() => {
    const name = `${t('deposit')} ${depositAmount.amountPretty} ${tokenData.token.symbol}`
    const overrides: Overrides = { gasLimit: 750000 }
    let callTransaction
    if (delegateData.ticketDelegate === ethers.constants.AddressZero) {
      callTransaction = async () => {
        const user = await getUser()
        return user.depositAndDelegate(depositAmount.amountUnformatted, usersAddress, overrides)
      }
    } else {
      callTransaction = async () => {
        const user = await getUser()
        return user.deposit(depositAmount.amountUnformatted, overrides)
      }
    }

    return _sendTransaction({
      name,
      callTransaction,
      callbacks: {
        onConfirmedByUser: () => logEvent(FathomEvent.deposit),
        onSuccess: () => {
          refetchTicketDelegate()
          refetchUsersTotalTwab()
          refetchUsersBalances()
        },
        refetch: () => {
          refetchUsersTotalTwab()
          refetchUsersBalances()
        }
      }
    })
  }, [depositAmount, usersAddress, prizePool.id()])
}
