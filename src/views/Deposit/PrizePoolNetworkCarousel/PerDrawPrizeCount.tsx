import { Dot } from '@components/Dot'
import { PrizePoolBar } from '@components/PrizePoolBar'
import { PrizePoolTable } from '@components/PrizePoolTable'
import { useAllPrizePoolExpectedPrizes } from '@hooks/v4/PrizePool/useAllPrizePoolExpectedPrizes'
import { usePrizePools } from '@hooks/v4/PrizePool/usePrizePools'
import { useAllLatestDrawWinners } from '@hooks/v4/useDrawWinners'
import { useAllLatestDrawWinnersInfo } from '@hooks/v4/useDrawWinnersInfo'
import { CountUp, ExternalLink } from '@pooltogether/react-components'
import classNames from 'classnames'
import { Trans, useTranslation } from 'next-i18next'
import { useMemo } from 'react'
import { CarouselDescription, CarouselHeader } from '.'

/**
 * Sorted by the total number of prizes won last draw in the prize pool
 * @param props
 * @returns
 */
export const PerDrawPrizeCount: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const { t } = useTranslation()
  const prizePools = usePrizePools()
  const queryResults = useAllLatestDrawWinnersInfo()

  const { data, totalNumberOfPrizes } = useMemo(() => {
    const isFetched = queryResults.some(({ isFetched }) => isFetched)
    if (!isFetched) {
      return { data: [], totalNumberOfPrizes: 0 }
    }

    const totalNumberOfPrizes = queryResults
      .filter(({ isFetched, isError }) => isFetched && !isError)
      .reduce((total, { data }) => total + data.prizesWon, 0)

    const data = queryResults
      .filter(({ isFetched, isError }) => isFetched && !isError)
      .map(({ data }) => {
        return {
          prizePool: prizePools.find((prizePool) => prizePool.chainId === data.chainId),
          numberOfPrizes: Math.round(data.prizesWon),
          prizes: data.prizesWon,
          percentage: data.prizesWon / totalNumberOfPrizes
        }
      })
      .sort((a, b) => b.numberOfPrizes - a.numberOfPrizes)
    return { data, totalNumberOfPrizes }
  }, [prizePools, queryResults])

  return (
    <div className={classNames('relative', className)}>
      <Dots />
      <CarouselHeader
        headers={[
          {
            title: t('prizesWonLastDraw'),
            stat: (
              <span className='text-flashy'>
                <CountUp countTo={totalNumberOfPrizes} decimals={0} />
              </span>
            )
          }
        ]}
      />
      <CarouselDescription>
        <Trans
          i18nKey='prizesWonLastDrawExplainer'
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
        headers={{ prizes: t('prizesWonLastDraw') }}
        data={data}
        className='mt-2 sm:mt-4 max-w-screen-xs mx-auto'
      />
    </div>
  )
}

const Dots = () => (
  <>
    {/* Left */}
    <Dot className='top-2 left-0' />
    <Dot className='top-10 left-6 xs:left-12' />
    <Dot className='top-20 xs:-top-2 left-20' />

    {/* Right */}
    <Dot className='top-4 right-0' />
    <Dot className='top-12 right-8' />
    <Dot className='top-14 right-0  xs:right-32' />
  </>
)
