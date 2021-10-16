import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { ThemedClipSpinner, Card, Tooltip } from '@pooltogether/react-components'
import { Amount } from '@pooltogether/hooks'
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
import { roundPrizeAmount } from 'lib/utils/roundPrizeAmount'

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
        <Card>
          <div className='opacity-70 text-center w-full'>
            {t('noDrawsYet', 'No draws yet, check back soon')}
          </div>
        </Card>
      )}
      <ul className='space-y-4 z-30'>
        {drawsAndPrizeDistributions.map((drawAndPrizeDistribution) => {
          const drawId = drawAndPrizeDistribution.draw.drawId
          return (
            <PastPrizeListItem
              key={`past-prize-list-${drawId}-${prizeDistributor.id()}`}
              {...drawAndPrizeDistribution}
              prizeDistributor={prizeDistributor}
              token={prizePoolTokens.token}
              ticket={prizePoolTokens.ticket}
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

const PastPrizeListItem = (props: PastPrizeListItemProps) => {
  const pendingClassName = 'font-bold text-inverse text-xs xs:text-sm opacity-90'

  return (
    <li>
      <Card style={{ minHeight: 100 }}>
        <div className='flex flex-col xs:flex-row justify-between leading-none'>
          <div className='flex flex-col'>
            <span className='flex items-start'>
              <DrawId
                className='uppercase font-bold text-accent-2 opacity-50 text-xs xs:text-sm leading-none mr-2'
                {...props}
              />
              <DrawDate
                className='uppercase font-bold text-accent-1 opacity-80 text-xs xs:text-sm leading-none'
                {...props}
              />
            </span>

            <ExtraDetailsSection {...props} className='mt-2' />

            <PropagatingMessage pendingClassName={pendingClassName} {...props} />
          </div>

          <span className='mt-6 xs:mt-0'>
            <PrizeDistributorTotal
              {...props}
              pendingClassName={pendingClassName}
              numberClassName='font-bold text-inverse text-xs xs:text-sm'
              textClassName='font-bold text-inverse text-xs xs:text-sm ml-1 opacity-60'
            />
            <div className='mt-2'>
              <ViewPrizeTiersTrigger
                {...props}
                className='uppercase font-bold text-xs underline text-highlight-9 hover:text-highlight-2 sm:text-sm transition leading-none tracking-wide'
              />
            </div>
          </span>
        </div>
      </Card>
    </li>
  )
}

const PropagatingMessage = (props) => {
  const { t } = useTranslation()

  if (props.prizeDistribution) {
    return null
  }

  return (
    <div className={props.pendingClassName}>
      <Tooltip
        id={`tooltip-what-is-propagating`}
        tip={t(
          'propagatingMeans',
          'There is a 24 hour cooldown while the prize is being distributed to all networks. You can check if you won this prize 24 hours after the draw.'
        )}
        className='flex items-center mt-4'
      >
        <ThemedClipSpinner size={10} className='mr-2' />{' '}
        <span className='uppercase flex items-center'>
          {' '}
          {t('propagating', 'Propagating ...')}{' '}
          <FeatherIcon icon='help-circle' className='relative w-4 h-4 text-inverse ml-2' />
        </span>
      </Tooltip>
    </div>
  )
}

const ExtraDetailsSection = (props: { className?: string } & PastPrizeListItemProps) => {
  const { claimedAmount, prizeDistributor, draw, className, ticket, drawLock } = props

  const { t } = useTranslation()

  const usersAddress = useUsersAddress()

  const drawLockCountdown = useTimeUntil(drawLock?.endTimeSeconds.toNumber())

  // TODO: Move stored draw results to a hook so this reacts when pushing new results
  const storedDrawResult =
    usersAddress && getStoredDrawResult(usersAddress, prizeDistributor, draw.drawId)
  const amountUnformatted = claimedAmount?.amountUnformatted
  const userHasClaimed = amountUnformatted && !amountUnformatted?.isZero()
  const userHasAmountToClaim = storedDrawResult && !storedDrawResult.drawResults.totalValue.isZero()

  if (drawLockCountdown?.secondsLeft) {
    const { weeks, days, hours, minutes } = drawLockCountdown
    const thereIsWeeks = weeks > 0
    const thereIsDays = thereIsWeeks || days > 0
    const thereIsHours = thereIsDays || hours > 0
    const thereIsMinutes = thereIsHours || minutes > 0
    return (
      <div className={classNames('text-inverse flex', className)}>
        <FeatherIcon icon='lock' className='w-4 h-4 my-auto mr-2' />
        {t('drawNumber', 'Draw #{{number}}', { number: draw.drawId })}{' '}
        {t('unlocksIn', 'unlocks in')}
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
      <span className={classNames('text-inverse', className)}>
        {t('noPrizesWon', 'No prizes won')}
      </span>
    )
  } else if (usersAddress && !userHasClaimed && userHasAmountToClaim) {
    const { amountPretty } = roundPrizeAmount(
      storedDrawResult?.drawResults.totalValue,
      ticket.decimals
    )
    return (
      <div className={classNames(className, 'animate-pulse')}>
        <span className='text-accent-1'>{t('unclaimed', 'Unclaimed')}</span>
        <span className='ml-2 font-bold'>{amountPretty}</span>
        <span className='ml-2 font-bold'>{ticket.symbol}</span>
      </div>
    )
  } else if (usersAddress && claimedAmount && !claimedAmount.amountUnformatted.isZero()) {
    const { amountPretty } = claimedAmount
    return (
      <div className={classNames(className)}>
        <span className='text-accent-1'>{t('claimed', 'Claimed')}</span>
        <span className='ml-2 font-bold'>{amountPretty}</span>
        <span className='ml-2 font-bold'>{ticket.symbol}</span>
      </div>
    )
  } else {
    return null
  }
}

const PastDrawsListHeader = (props: { className?: string }) => {
  const { t } = useTranslation()
  return (
    <div className={classNames(props.className, 'pt-4 pb-2')}>
      <span className='font-semibold text-accent-1 text-lg'>{t('pastDraws', 'Past draws')}</span>
    </div>
  )
}

const LoadingRow = () => <div className='w-full rounded-lg animate-pulse bg-card h-36' />
