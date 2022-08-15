import { getMaxPrecision, safeParseUnits } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useTranslation } from 'react-i18next'
import { useMinimumDepositAmount } from './useMinimumDepositAmount'
import { usePrizePoolTokens } from './usePrizePoolTokens'
import { useUsersPrizePoolBalancesWithFiat } from './useUsersPrizePoolBalancesWithFiat'

/**
 * Returns validation rules for the deposit input
 * @param prizePool
 * @returns
 */
export const useDepositValidationRules = (prizePool: PrizePool) => {
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const { data: prizePoolTokens } = usePrizePoolTokens(prizePool)
  const { data: usersBalancesData } = useUsersPrizePoolBalancesWithFiat(usersAddress, prizePool)

  const token = prizePoolTokens?.token
  const decimals = token?.decimals
  const minimumDepositAmount = useMinimumDepositAmount(prizePool, token)
  const usersBalances = usersBalancesData?.balances
  const tokenBalance = usersBalances?.token
  const ticketBalance = usersBalances?.ticket

  return {
    isValid: (v: string) => {
      const isNotANumber = isNaN(Number(v))
      if (isNotANumber) return 'NaN'
      if (!minimumDepositAmount) return `Doesn't meet minimum deposit`

      const quantityUnformatted = safeParseUnits(v, decimals)

      if (!!usersAddress) {
        if (!tokenBalance) return 'No token balance fetched'
        if (!ticketBalance) return 'No ticket balance fetched'
        if (quantityUnformatted && tokenBalance.amountUnformatted.lt(quantityUnformatted))
          return t(
            'insufficientFundsGetTokensBelow',
            'Insufficient funds. Get or swap tokens below.'
          )
        if (quantityUnformatted && minimumDepositAmount.amountUnformatted.gt(quantityUnformatted))
          return t(
            'minimumDepositOfAmountRequired',
            `Minimum deposit of {{amount}} {{token}} required`,
            { amount: minimumDepositAmount.amountPretty, token: token.symbol }
          )
      }

      if (getMaxPrecision(v) > Number(decimals)) return 'getMaxPrecision'
      if (quantityUnformatted && quantityUnformatted.isZero()) return 'isZero'
      return true
    }
  }
}
