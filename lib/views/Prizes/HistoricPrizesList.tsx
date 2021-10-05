import { Card } from '@pooltogether/react-components'
import { DrawPrize, PrizePool } from '@pooltogether/v4-js-client'
import classNames from 'classnames'
import { SelectedNetworkToggle } from 'lib/components/SelectedNetworkToggle'
import { useClaimableDrawsAndPrizeDistributions } from 'lib/hooks/Tsunami/DrawPrizes/useClaimableDrawsAndPrizeDistributions'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { DrawDetails, DrawDetailsProps } from './DrawCard'

export const HistoricPrizesList = (props: { drawPrize: DrawPrize; prizePool: PrizePool }) => {
  const { prizePool, drawPrize } = props
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)
  const { data: drawsAndPrizeDistributions, isFetched: isDrawsAndPrizeDistributionsFetched } =
    useClaimableDrawsAndPrizeDistributions(drawPrize)

  if (!isPrizePoolTokensFetched || !isDrawsAndPrizeDistributionsFetched) {
    return (
      <>
        <HistoricPrizesListHeader className='mb-4' />
        <ul className='space-y-4'>
          <LoadingRow />
          <LoadingRow />
          <LoadingRow />
        </ul>
      </>
    )
  }
  return (
    <>
      <HistoricPrizesListHeader className='mb-4' />{' '}
      <ul className='space-y-4'>
        {drawsAndPrizeDistributions.map((drawAndPrizeDistribution) => (
          <PastPrizeListItem
            key={`past-prize-list-${drawAndPrizeDistribution.draw.drawId}-${drawPrize.id()}`}
            {...drawAndPrizeDistribution}
            token={prizePoolTokens.token}
          />
        ))}
      </ul>
    </>
  )
}

const PastPrizeListItem = (props: DrawDetailsProps) => (
  <li>
    <Card>
      <DrawDetails {...props} />
    </Card>
  </li>
)

const HistoricPrizesListHeader = (props: { className?: string }) => {
  const { t } = useTranslation()
  return (
    <div
      className={classNames(
        props.className,
        'flex justify-between sticky top-20 sm:top-24 bg-body py-2 z-10'
      )}
    >
      <span className='font-semibold text-accent-1 text-lg'>{t('pastPrizes', 'Past prizes')}</span>
      <SelectedNetworkToggle />
    </div>
  )
}

const LoadingRow = () => <div className='w-full rounded-lg animate-pulse bg-card h-36' />
