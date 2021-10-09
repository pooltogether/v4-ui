import { Amount } from '@pooltogether/hooks'
import { Card } from '@pooltogether/react-components'
import { PrizeDistributor, PrizePool } from '@pooltogether/v4-js-client'
import classNames from 'classnames'
import { SelectedNetworkToggle } from 'lib/components/SelectedNetworkToggle'
import { usePastDrawsForUser } from 'lib/hooks/Tsunami/PrizeDistributor/usePastDrawsForUser'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { getStoredDrawResult } from 'lib/utils/drawResultsStorage'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  DrawDate,
  DrawDetailsProps,
  DrawId,
  PrizeDistributorTotal,
  ViewPrizeTiersTrigger
} from './DrawCard/DrawDetails'

export const HistoricPrizesList = (props: {
  prizeDistributor: PrizeDistributor
  prizePool: PrizePool
}) => {
  const { prizePool, prizeDistributor } = props

  const { t } = useTranslation()

  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)
  const { data: pastDraws, isFetched: isDrawsAndPrizeDistributionsFetched } = usePastDrawsForUser(
    prizeDistributor,
    prizePoolTokens?.token
  )

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
      {pastDraws.length === 0 && (
        <div className='opacity-70 text-center w-full mt-12'>
          {t('noDrawsYet', 'No draws yet, check back soon')}
        </div>
      )}
      <ul className='space-y-4'>
        {pastDraws.map((pastDraw) => (
          <PastPrizeListItem
            key={`past-prize-list-${pastDraw.draw.drawId}-${prizeDistributor.id()}`}
            {...pastDraw}
            prizeDistributor={prizeDistributor}
            token={prizePoolTokens.token}
          />
        ))}
      </ul>
    </>
  )
}

interface PastPrizeListItemProps extends DrawDetailsProps {
  claimedAmount: Amount
  prizeDistributor: PrizeDistributor
}

const PastPrizeListItem = (props: PastPrizeListItemProps) => (
  <li>
    <Card>
      <div className='flex flex-row space-x-2 mb-1'>
        <DrawId {...props} />
        <DrawDate {...props} />
      </div>
      <div className='flex justify-between'>
        <PrizeDistributorTotal {...props} numberClassName='font-bold text-xl' />
        <ViewPrizeTiersTrigger {...props} />
      </div>
      <ClaimedAmountSection {...props} className='mt-2' />
    </Card>
  </li>
)

const ClaimedAmountSection = (props: { className?: string } & PastPrizeListItemProps) => {
  const { claimedAmount, prizeDistributor, draw, className, token } = props
  const { amountUnformatted } = claimedAmount

  const { t } = useTranslation()

  const usersAddress = useUsersAddress()

  const storedDrawResult = getStoredDrawResult(usersAddress, prizeDistributor, draw.drawId)

  const userHasntClaimed = amountUnformatted.isZero()
  const userHasAmountToClaim = !storedDrawResult?.drawResults.totalValue.isZero()

  if (!Boolean(storedDrawResult)) {
    return null
  } else if (userHasntClaimed && !userHasAmountToClaim) {
    return (
      <span className={classNames('text-accent-1', className)}>
        {t('noPrizesWon', 'No prizes won')}
      </span>
    )
  } else if (userHasntClaimed && userHasAmountToClaim) {
    const { amountPretty } = getAmountFromBigNumber(
      storedDrawResult?.drawResults.totalValue,
      token.decimals
    )
    return (
      <div className={classNames(className, 'animate-pulse')}>
        <span className='text-accent-1'>{t('unclaimed', 'Unclaimed')}</span>
        <span className='ml-2 font-bold'>{amountPretty}</span>
        <span className='ml-2 font-bold'>{token.symbol}</span>
      </div>
    )
  }

  const { amountPretty } = claimedAmount

  return (
    <div className={classNames(className)}>
      <span className='text-accent-1'>{t('claimed', 'Claimed')}</span>
      <span className='ml-2 font-bold'>{amountPretty}</span>
      <span className='ml-2 font-bold'>{token.symbol}</span>
    </div>
  )
}

const HistoricPrizesListHeader = (props: { className?: string }) => {
  const { t } = useTranslation()
  return (
    <div
      className={classNames(
        props.className,
        'flex justify-between sticky top-12 sm:top-20 bg-body pt-4 pb-2 z-10'
      )}
    >
      <span className='font-semibold text-accent-1 text-lg'>{t('pastDraws', 'Past draws')}</span>
      <SelectedNetworkToggle />
    </div>
  )
}

const LoadingRow = () => <div className='w-full rounded-lg animate-pulse bg-card h-36' />
