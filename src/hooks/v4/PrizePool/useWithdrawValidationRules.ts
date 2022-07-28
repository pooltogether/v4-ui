import { getMaxPrecision, safeParseUnits } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { ethers } from 'ethers'
import { useTranslation } from 'react-i18next'
import { usePrizePoolTokens } from './usePrizePoolTokens'
import { useUsersPrizePoolBalancesWithFiat } from './useUsersPrizePoolBalancesWithFiat'

/**
 * Returns validation rules for the withdraw input
 * @param prizePool
 * @returns
 */
export const useWithdrawValidationRules = (prizePool: PrizePool) => {
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const { data: prizePoolTokens } = usePrizePoolTokens(prizePool)
  const { data: usersBalancesData } = useUsersPrizePoolBalancesWithFiat(usersAddress, prizePool)

  const token = prizePoolTokens?.token
  const decimals = token?.decimals
  const usersBalances = usersBalancesData?.balances
  const tokenBalance = usersBalances?.token
  const ticketBalance = usersBalances?.ticket

  return {
    isValid: (v: string) => {
      const isNotANumber = isNaN(Number(v))
      if (isNotANumber) return 'NaN'

      const quantityUnformatted = safeParseUnits(v, decimals)
      if (!quantityUnformatted) return false

      console.log({ quantityUnformatted, str: quantityUnformatted.toString(), tokenBalance })

      if (quantityUnformatted.isZero()) return false
      if (quantityUnformatted.lt(ethers.constants.Zero)) return false

      if (!!usersAddress) {
        if (!tokenBalance) return 'No token balance fetched'
        if (!ticketBalance) return 'No ticket balance fetched'

        if (quantityUnformatted.gt(ticketBalance.amountUnformatted)) return t('insufficientFunds')
      }

      if (getMaxPrecision(v) > Number(decimals)) return 'getMaxPrecision'
      return true
    }
  }
}
