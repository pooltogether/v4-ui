import { CurrencyValue, formatCurrencyValue } from '@components/CurrencyValue'
import { Dot } from '@components/Dot'
import { PrizePoolBar } from '@components/PrizePoolBar'
import { PrizePoolTable } from '@components/PrizePoolTable'
import { useSelectedCurrency } from '@hooks/useSelectedCurrency'
import { useAllPrizePoolTicketTotalSupplies } from '@hooks/v4/PrizePool/useAllPrizePoolTicketTotalSupplies'
import { usePrizePools } from '@hooks/v4/PrizePool/usePrizePools'
import { usePrizePoolNetworkTicketTotalSupply } from '@hooks/v4/PrizePoolNetwork/usePrizePoolNetworkTicketTotalSupply'
import { useCoingeckoExchangeRates } from '@pooltogether/hooks'
import { ExternalLink } from '@pooltogether/react-components'
import { divideBigNumbers } from '@pooltogether/utilities'
import classNames from 'classnames'
import { parseEther } from 'ethers/lib/utils'
import { Trans, useTranslation } from 'next-i18next'
import { useMemo } from 'react'
import { CarouselDescription, CarouselHeader } from '.'

/**
 * Sorted by the TVL of the prize pool
 * @param props
 * @returns
 */
export const PrizePoolNetworkTvl: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const { t } = useTranslation()
  const prizePools = usePrizePools()
  const queryResults = useAllPrizePoolTicketTotalSupplies()
  const { data: tvl } = usePrizePoolNetworkTicketTotalSupply()
  const { data: exchangeRates } = useCoingeckoExchangeRates()
  const { currency } = useSelectedCurrency()

  const data = useMemo(() => {
    const isFetched = queryResults.every(({ isFetched }) => isFetched)
    if (!isFetched || !tvl) {
      return []
    }

    return queryResults
      .filter(({ isFetched, isError }) => isFetched && !isError)
      .map(({ data }) => {
        return {
          prizePool: prizePools.find((prizePool) => prizePool.id() === data.prizePoolId),
          tvl: formatCurrencyValue(data?.amount.amount || 0, currency, exchangeRates, {
            decimals: 0
          }),
          amount: data.amount,
          percentage: divideBigNumbers(
            parseEther(data.amount.amount),
            tvl.totalSupply.amountUnformatted
          )
        }
      })
      .sort((a, b) => (b.amount.amountUnformatted.gt(a.amount.amountUnformatted) ? 1 : -1))
  }, [queryResults, tvl, exchangeRates, currency])

  return (
    <div className={classNames('relative', className)}>
      <Dots />
      <CarouselHeader
        headers={[
          {
            title: t('totalDeposits'),
            stat: (
              <CurrencyValue
                baseValue={tvl?.totalSupply.amount}
                options={{ minimumFractionDigits: 0, maximumFractionDigits: 0 }}
              />
            )
          }
        ]}
      />
      <CarouselDescription>
        <Trans
          i18nKey='totalDepositsExplainer'
          components={{
            a: (
              <ExternalLink
                children={undefined}
                underline
                href='https://docs.pooltogether.com/welcome/faq#where-does-the-prize-money-come-from'
              />
            )
          }}
        />
      </CarouselDescription>
      <PrizePoolBar
        data={data}
        className='mt-4 sm:mt-8'
        borderClassName='border-white dark:border-pt-purple-darkest'
      />
      <PrizePoolTable
        headers={{ tvl: 'TVL' }}
        data={data}
        className='mt-2 sm:mt-4 max-w-screen-xs mx-auto'
      />
    </div>
  )
}

const Dots = () => (
  <>
    {/* Left */}
    <Dot className='top-12 left-4' />
    <Dot className='top-10 left-6 xs:left-12' />
    <Dot className='top-20 xs:-top-2 left-20' />

    {/* Right */}
    <Dot className='top-4 right-0' />
    <Dot className='top-12 right-4' />
    <Dot className='top-14 right-0 xs:top-0 xs:right-28' />
  </>
)
