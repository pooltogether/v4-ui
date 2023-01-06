import { useSendTransaction } from '@hooks/useSendTransaction'
import { Amount } from '@pooltogether/hooks'
import { ERC2612PermitMessage } from '@pooltogether/v4-client-js'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { FathomEvent, logEvent } from '@utils/services/fathom'
import { RSV } from 'eth-permit/dist/rpc'
import { ethers, Overrides } from 'ethers'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetUser } from '../User/useGetUser'
import { useSelectedPrizePool } from './useSelectedPrizePool'
import { useSelectedPrizePoolTokens } from './useSelectedPrizePoolTokens'
import { useUsersPrizePoolBalancesWithFiat } from './useUsersPrizePoolBalancesWithFiat'
import { useUsersTicketDelegate } from './useUsersTicketDelegate'
import { useUsersTotalTwab } from './useUsersTotalTwab'

export const useSendDepositTransaction = (
  depositAmount: Amount,
  eip2612?: {
    depositPermit: ERC2612PermitMessage & RSV
    delegationPermit: ERC2612PermitMessage & RSV
  }
) => {
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
    let callTransaction
    if (!!eip2612) {
      if (!eip2612.depositPermit || !eip2612.delegationPermit) {
        throw Error('No valid deposit and delegation EIP2612 permits.')
      }
      // TODO: confirm gasLimit override once function has been tested
      // const overrides: Overrides = { gasLimit: 750000 }
      callTransaction = async () => {
        const user = await getUser()
        const delegationTarget =
          delegateData.ticketDelegate === ethers.constants.AddressZero
            ? usersAddress
            : delegateData.ticketDelegate
        return user.depositAndDelegateWithSignature(
          depositAmount.amountUnformatted,
          eip2612.depositPermit,
          eip2612.delegationPermit,
          delegationTarget
          // overrides
        )
      }
    } else if (delegateData.ticketDelegate === ethers.constants.AddressZero) {
      const overrides: Overrides = { gasLimit: 750000 }
      callTransaction = async () => {
        const user = await getUser()
        return user.depositAndDelegate(depositAmount.amountUnformatted, usersAddress, overrides)
      }
    } else {
      callTransaction = async () => {
        const overrides: Overrides = { gasLimit: 750000 }
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
