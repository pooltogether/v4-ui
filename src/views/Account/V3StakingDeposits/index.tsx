import { BigNumber } from 'ethers'
import { CardTitle } from '@components/Text/CardTitle'
import { useUsersAddress } from '@hooks/useUsersAddress'
import { useUsersV3LPPoolBalances } from '@hooks/v3/useUsersV3LPPoolBalances'
import { useUsersV3POOLPoolBalances } from '@hooks/v3/useUsersV3POOLPoolBalances'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { LPStakingCards } from './LPStakingCards'
import { POOLStakingCards } from './POOLStakingCards'

export const V3StakingCards = () => {
  const usersAddress = useUsersAddress()
  const { t } = useTranslation()

  const { data: v3POOLPoolBalancesData, isFetched: isV3POOLPoolFetched } =
    useUsersV3POOLPoolBalances(usersAddress)
  const { data: v3LPPoolBalances, isFetched: isV3LPPoolFetched } =
    useUsersV3LPPoolBalances(usersAddress)

  const { isFetched, amount } = useMemo(() => {
    const v3POOLPoolTotalBalanceUsdScaled = isV3POOLPoolFetched
      ? v3POOLPoolBalancesData.totalValueUsdScaled
      : BigNumber.from(0)
    const v3LPPoolTotalBalanceUsdScaled = isV3LPPoolFetched
      ? v3LPPoolBalances.totalValueUsdScaled
      : BigNumber.from(0)

    const totalBalanceUsdScaled = v3POOLPoolTotalBalanceUsdScaled.add(v3LPPoolTotalBalanceUsdScaled)
    const amount = getAmountFromBigNumber(totalBalanceUsdScaled, '2')
    return {
      amount,
      isFetched: isV3POOLPoolFetched && isV3LPPoolFetched
    }
  }, [isV3POOLPoolFetched, isV3LPPoolFetched])

  return (
    <div className='flex flex-col space-y-2'>
      <CardTitle title={t('staking')} secondary={`$${amount.amountPretty}`} loading={!isFetched} />
      <POOLStakingCards />
      <LPStakingCards />
    </div>
  )
}
