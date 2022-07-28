import { useSendTransaction } from '@hooks/useSendTransaction'
import { Amount } from '@pooltogether/hooks'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { FathomEvent, logEvent } from '@utils/services/fathom'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSignerGaugeController } from './useSignerGaugeController'
import { useSelectedPrizePoolTokens } from '../PrizePool/useSelectedPrizePoolTokens'
import { useUsersTotalTwab } from '../PrizePool/useUsersTotalTwab'
import { useSelectedGaugeController } from './useSelectedGaugeController'
import { useGaugeToken } from './useGaugeToken'
import { useUsersGaugeBalance } from './useUsersGaugeBalance'
import { useUsersGaugeControllerBalance } from './useUsersGaugeControllerBalance'

export const useSendStakeTransaction = (stakeAmount: Amount) => {
  const _sendTransaction = useSendTransaction()
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const { data: prizePoolTokens } = useSelectedPrizePoolTokens()
  const { refetch: refetchUsersTotalTwab } = useUsersTotalTwab(usersAddress)
  const { data: _gaugeController } = useSelectedGaugeController()
  const signerGaugeController = useSignerGaugeController(_gaugeController)
  const { data: token } = useGaugeToken(_gaugeController)
  const { data: balanceUnformatted, refetch: refetchGaugeBalance } = useUsersGaugeBalance(
    usersAddress,
    prizePoolTokens?.ticket.address,
    _gaugeController
  )
  const { refetch: refetchGaugeControllerBalance } = useUsersGaugeControllerBalance(
    usersAddress,
    _gaugeController
  )

  return useCallback(() => {
    const name = `${t('stake')} ${stakeAmount.amountPretty} ${token.symbol}`
    const callTransaction = async () => {
      // TODO: We need multicall...
      // Ideally we deposit then increaseGauge in a single transaction
      return signerGaugeController.increaseGauge(
        prizePoolTokens?.ticket.address,
        stakeAmount.amountUnformatted,
        { gasLimit: 5000000 }
      )
    }

    return _sendTransaction({
      name,
      callTransaction,
      callbacks: {
        onConfirmedByUser: () => logEvent(FathomEvent.deposit),
        onSuccess: () => {
          // TODO: Refetch POOL balance in other places?
          refetchGaugeBalance()
          refetchGaugeControllerBalance()
        },
        refetch: () => {
          // TODO: Refetch POOL balance in other places?
          refetchGaugeBalance()
          refetchGaugeControllerBalance()
        }
      }
    })
  }, [stakeAmount, usersAddress, _gaugeController?.id()])
}
