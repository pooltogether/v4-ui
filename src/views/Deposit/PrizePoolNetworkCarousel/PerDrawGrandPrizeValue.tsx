import { CurrencyValue, formatCurrencyValue } from '@components/CurrencyValue'
import { Dot } from '@components/Dot'
import { PrizePoolTable } from '@components/PrizePoolTable'
import { useSelectedCurrency } from '@hooks/useSelectedCurrency'
import { useAllPrizePoolExpectedPrizes } from '@hooks/v4/PrizePool/useAllPrizePoolExpectedPrizes'
import { usePrizePools } from '@hooks/v4/PrizePool/usePrizePools'
import { useCoingeckoExchangeRates } from '@pooltogether/hooks'
import { ExternalLink } from '@pooltogether/react-components'
import classNames from 'classnames'
import { Trans, useTranslation } from 'next-i18next'
import { useMemo } from 'react'
import { CarouselDescription, CarouselHeader } from '.'
import { usePrizePoolNetworkGrandPrize } from '../../../hooks/v4/PrizePoolNetwork/usePrizePoolNetworkGrandPrize'

/**
 * Sorted by Grand Prize Value
 * @param props
 * @returns
 */
export const PerDrawGrandPrizeValue: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const { t } = useTranslation()
  const prizePools = usePrizePools()
  const queryResults = useAllPrizePoolExpectedPrizes()
  const { data: grandPrizeData } = usePrizePoolNetworkGrandPrize()
  const { data: exchangeRates } = useCoingeckoExchangeRates()
  const { currency } = useSelectedCurrency()

  const data = useMemo(() => {
    const isFetched = queryResults.some(({ isFetched }) => isFetched)
    if (!isFetched) {
      return null
    }
    return queryResults
      .filter(({ isFetched, isError }) => isFetched && !isError)
      .map(({ data }) => {
        const formattedPrizes = data.uniqueValueOfPrizesFormattedList.map((v) =>
          formatCurrencyValue(v, currency, exchangeRates, { hideZeroes: true })
        )
        const prizes = (
          <div className='flex justify-center space-x-2'>
            <b>{formattedPrizes[0]}</b>
            {formattedPrizes.slice(1).map((p) => (
              <span key={`prize-${p}-${data.prizePoolId}`}>{p}</span>
            ))}
          </div>
        )

        return {
          prizePool: prizePools.find((prizePool) => prizePool.id() === data.prizePoolId),
          grandPrizeValue: data.grandPrizeValue,
          prizes
        }
      })
      .sort((a, b) =>
        b.grandPrizeValue.amountUnformatted.sub(a.grandPrizeValue.amountUnformatted).toNumber()
      )
  }, [prizePools, queryResults, exchangeRates, currency])

  return (
    <div className={classNames('relative', className)}>
      <Dots />
      <CarouselHeader
        headers={[
          {
            title: t('largestGrandPrize'),
            stat: (
              <span className='text-flashy'>
                <CurrencyValue
                  baseValue={grandPrizeData?.grandPrizeValue.amount}
                  options={{ countUp: true, decimals: 0 }}
                />
              </span>
            )
          }
        ]}
      />
      <CarouselDescription className='mb-4'>
        <Trans
          i18nKey='grandPrizeExplainer'
          components={{
            a: (
              <ExternalLink
                children={undefined}
                underline
                href='https://docs.pooltogether.com/welcome/faq#how-many-prizes-are-awarded'
              />
            )
          }}
        />
      </CarouselDescription>
      <PrizePoolTable
        headers={{ prizes: t('potentialPrizes') }}
        data={data}
        className='mt-2 sm:mt-4 max-w-screen-xs mx-auto'
      />
    </div>
  )
}

const Dots = () => (
  <>
    {/* Left */}
    <Dot className='top-4 left-2' />
    <Dot className='top-0 left-4 xs:left-8' />

    {/* Right */}
    <Dot className='top-4 right-0' />
    <Dot className='top-12 right-8' />
    <Dot className='top-14 right-0 xs:top-0 xs:right-32' />
  </>
)
