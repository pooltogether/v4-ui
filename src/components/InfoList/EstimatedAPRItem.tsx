import { BigNumber } from 'ethers'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { Amount } from '@pooltogether/hooks'
import { NO_REFETCH } from '@pooltogether/hooks/dist/constants'

import { InfoListItem } from '.'
import { useUpcomingPrizeTier } from '@hooks/useUpcomingPrizeTier'
import { usePrizePoolNetworkTicketTotalSupply } from '@hooks/v4/PrizePool/usePrizePoolNetworkTicketTotalSupply'

interface EstimatedAPRItemProps {
  chainId: number
  labelClassName?: string
  valueClassName?: string
}

/**
 * TODO: Expand this calculation for different prize distributions.
 * @param props
 * @returns
 */
export const EstimatedAPRItem = (props: EstimatedAPRItemProps) => {
  const { labelClassName, valueClassName } = props
  const { data: apr, isFetched } = useV4Apr()
  const { t } = useTranslation()
  return (
    <InfoListItem
      labelClassName={labelClassName}
      valueClassName={valueClassName}
      label={t('estimatedAverageApr', 'Estimated average APR')}
      labelToolTip={t(
        'estimatedAverageAprTooltip',
        'Estimated average APR is a rough estimate based on the current TVL and daily prizes'
      )}
      loading={!isFetched}
      labelLink='https://docs.pooltogether.com/faq/prizes-and-winning#what-is-the-prize-apr'
      value={`${apr}%`}
    />
  )
}

export const useV4Apr = () => {
  const { data: prizeTier, isFetched: isPrizeTierFetched } = useUpcomingPrizeTier()
  const { data: totalSupply, isFetched: isTotalSupplyFetched } =
    usePrizePoolNetworkTicketTotalSupply()
  const enabled = isPrizeTierFetched && isTotalSupplyFetched
  return useQuery(
    ['useV4Apr', prizeTier, totalSupply],
    () => getV4Apr(totalSupply, prizeTier.prize),
    {
      ...NO_REFETCH,
      enabled
    }
  )
}

const getV4Apr = async (totalSupply: Amount, dailyPrizeAmountUnformatted: BigNumber) => {
  const totalYearlyPrizesUnformatted = dailyPrizeAmountUnformatted.mul(365)

  const totalTotalSupply = Number(totalSupply.amount)
  const totalYearlyPrizes = totalYearlyPrizesUnformatted.div(1e6).toNumber()

  return ((totalYearlyPrizes / totalTotalSupply) * 100).toFixed(2)
}
