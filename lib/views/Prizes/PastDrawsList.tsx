import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { Amount } from '@pooltogether/hooks'
import { Card } from '@pooltogether/react-components'
import { PrizeDistributor, PrizePool } from '@pooltogether/v4-js-client'
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
import { useAllDrawsAndPrizeDistributions } from 'lib/hooks/Tsunami/PrizeDistributor/useAllDrawsAndPrizeDistributions'
import { useUsersClaimedAmounts } from 'lib/hooks/Tsunami/PrizeDistributor/useUsersClaimedAmounts'
import { DrawLock, useDrawLocks } from 'lib/hooks/Tsunami/PrizeDistributor/useDrawLocks'
import { useTimeUntil } from 'lib/hooks/useTimeUntil'
import { CountdownString } from 'lib/components/CountdownString'

export const PastDrawsList = (props: {
  prizeDistributor: PrizeDistributor
  prizePool: PrizePool
}) => {
  const { prizePool, prizeDistributor } = props

  const { t } = useTranslation()

  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)

  const { data: drawsAndPrizeDistributions, isFetched: isDrawsAndPrizeDistributionsFetched } =
    useAllDrawsAndPrizeDistributions(prizeDistributor)
  const { data: claimedAmounts } = useUsersClaimedAmounts(prizeDistributor, prizePoolTokens?.token)
  const { data: drawLocks, isFetched: isDrawLocksFetched } = useDrawLocks()

  if (!isPrizePoolTokensFetched || !isDrawsAndPrizeDistributionsFetched || !isDrawLocksFetched) {
    return (
      <>
        <PastDrawsListHeader className='mb-1' />
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
      <PastDrawsListHeader className='mb-1' />
      {drawsAndPrizeDistributions.length === 0 && (
        <div className='opacity-70 text-center w-full mt-12'>
          {t('noDrawsYet', 'No draws yet, check back soon')}
        </div>
      )}
      <ul className='space-y-4'>
        {drawsAndPrizeDistributions.map((drawAndPrizeDistribution) => {
          const drawId = drawAndPrizeDistribution.draw.drawId
          return (
            <PastPrizeListItem
              key={`past-prize-list-${drawId}-${prizeDistributor.id()}`}
              {...drawAndPrizeDistribution}
              prizeDistributor={prizeDistributor}
              token={prizePoolTokens.token}
              claimedAmount={claimedAmounts?.[drawId]}
              drawLock={drawLocks[drawId]}
            />
          )
        })}
      </ul>
    </>
  )
}

interface PastPrizeListItemProps extends DrawDetailsProps {
  prizeDistributor: PrizeDistributor
  claimedAmount?: Amount
  drawLock?: DrawLock
}

const PastPrizeListItem = (props: PastPrizeListItemProps) => (
  <li>
    <Card>
      <div className='flex flex-row justify-between leading-none'>
        <span className='flex items-start'>
          <DrawId
            className='uppercase font-bold text-accent-2 opacity-50 text-xxs leading-none mr-2'
            {...props}
          />
          <DrawDate
            className='uppercase font-bold text-accent-1 opacity-80 text-xxs leading-none'
            {...props}
          />
        </span>
        <ViewPrizeTiersTrigger {...props} />
      </div>
      <div className='flex justify-between'>
        <PrizeDistributorTotal {...props} numberClassName='font-bold text-xl' />
      </div>
      <ExtraDetailsSection {...props} className='mt-2' />
    </Card>
  </li>
)

const ExtraDetailsSection = (props: { className?: string } & PastPrizeListItemProps) => {
  const { claimedAmount, prizeDistributor, draw, className, token, drawLock } = props

  const { t } = useTranslation()

  const usersAddress = useUsersAddress()

  const drawLockCountdown = useTimeUntil(drawLock?.endTimeSeconds.toNumber())

  // TODO: Move stored draw results to a hook so this reacts when pushing new results
  const storedDrawResult =
    usersAddress && getStoredDrawResult(usersAddress, prizeDistributor, draw.drawId)
  const amountUnformatted = claimedAmount?.amountUnformatted
  const userHasClaimed = amountUnformatted && !amountUnformatted?.isZero()
  const userHasAmountToClaim = storedDrawResult && !storedDrawResult.drawResults.totalValue.isZero()

  if (draw.drawId === 51) {
    console.log({ storedDrawResult, amountUnformatted, userHasClaimed, userHasAmountToClaim })
  }

  if (drawLockCountdown?.secondsLeft) {
    const { weeks, days, hours, minutes } = drawLockCountdown
    const thereIsWeeks = weeks > 0
    const thereIsDays = thereIsWeeks || days > 0
    const thereIsHours = thereIsDays || hours > 0
    const thereIsMinutes = thereIsHours || minutes > 0
    return (
      <div className={classNames('text-accent-1 flex', className)}>
        <FeatherIcon icon='lock' className='w-4 h-4 my-auto mr-2' />
        Draw #{draw.drawId} unlocks in
        <CountdownString
          className='ml-1'
          {...drawLockCountdown}
          hideHours={thereIsWeeks}
          hideMinutes={thereIsDays}
          hideSeconds={thereIsMinutes}
        />
      </div>
    )
  } else if (usersAddress && !userHasClaimed && !userHasAmountToClaim && storedDrawResult) {
    return (
      <span className={classNames('text-accent-1', className)}>
        {t('noPrizesWon', 'No prizes won')}
      </span>
    )
  } else if (usersAddress && !userHasClaimed && userHasAmountToClaim) {
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
  } else if (usersAddress && claimedAmount && !claimedAmount.amountUnformatted.isZero()) {
    const { amountPretty } = claimedAmount
    return (
      <div className={classNames(className)}>
        <span className='text-accent-1'>{t('claimed', 'Claimed')}</span>
        <span className='ml-2 font-bold'>{amountPretty}</span>
        <span className='ml-2 font-bold'>{token.symbol}</span>
      </div>
    )
  } else {
    return null
  }
}

const PastDrawsListHeader = (props: { className?: string }) => {
  const { t } = useTranslation()
  return (
    <div
      className={classNames(
        props.className,
        'flex justify-between sticky top-12 sm:top-20 bg-body pt-4 pb-2 z-10'
      )}
    >
      <span className='font-semibold text-accent-1 text-lg'>{t('pastDraws', 'Past draws')}</span>
    </div>
  )
}

const LoadingRow = () => <div className='w-full rounded-lg animate-pulse bg-card h-36' />
