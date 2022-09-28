import { AmountInPrizes } from '@components/AmountInPrizes'
import { CountdownString } from '@components/CountdownString'
import { CardTitle } from '@components/Text/CardTitle'
import { ViewPrizesSheetCustomTrigger } from '@components/ViewPrizesSheetButton'
import { useTimeUntil } from '@hooks/useTimeUntil'
import { useAllPartialDrawDatas } from '@hooks/v4/PrizeDistributor/useAllPartialDrawDatas'
import { DrawLock, useDrawLocks } from '@hooks/v4/PrizeDistributor/useDrawLocks'
import { useUsersClaimedAmounts } from '@hooks/v4/PrizeDistributor/useUsersClaimedAmounts'
import { useUsersNormalizedBalances } from '@hooks/v4/PrizeDistributor/useUsersNormalizedBalances'
import { useUsersStoredDrawResults } from '@hooks/v4/PrizeDistributor/useUsersStoredDrawResults'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { Amount, Token } from '@pooltogether/hooks'
import { ThemedClipSpinner, Card, Tooltip } from '@pooltogether/react-components'
import { Draw, PrizeDistribution, PrizeDistributor, PrizePool } from '@pooltogether/v4-client-js'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { getTimestampStringWithTime } from '@utils/getTimestampString'
import { roundPrizeAmount } from '@utils/roundPrizeAmount'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const PastDrawsList = (props: {
  prizeDistributor: PrizeDistributor
  prizePool: PrizePool
  className?: string
}) => {
  const { prizePool, prizeDistributor, className } = props

  const { t } = useTranslation()

  const usersAddress = useUsersAddress()
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)
  const { data: drawDatas, isFetched: isDrawsAndPrizeDistributionsFetched } =
    useAllPartialDrawDatas(prizeDistributor)
  const { data: claimedAmountsData } = useUsersClaimedAmounts(usersAddress, prizeDistributor)
  const { data: normalizedBalancesData } = useUsersNormalizedBalances(
    usersAddress,
    prizeDistributor
  )
  const { data: drawLocks, isFetched: isDrawLocksFetched } = useDrawLocks()

  const isDataForCurrentUser =
    usersAddress === normalizedBalancesData?.usersAddress &&
    usersAddress === claimedAmountsData?.usersAddress

  if (
    !isPrizePoolTokensFetched ||
    !isDrawsAndPrizeDistributionsFetched ||
    !isDrawLocksFetched ||
    (usersAddress && !isDataForCurrentUser)
  ) {
    return (
      <div className='flex flex-col space-x-2'>
        <CardTitle title={t('pastDraws', 'Past draws')} />
        <ul className='space-y-4'>
          <LoadingRow />
          <LoadingRow />
          <LoadingRow />
        </ul>
      </div>
    )
  }

  const drawDatasList = Object.values(drawDatas).reverse()

  return (
    <div className='flex flex-col space-y-2'>
      <CardTitle title={t('pastDraws', 'Past draws')} />
      {drawDatasList.length === 0 && (
        <Card>
          <div className='opacity-70 text-center w-full'>
            {t('noDrawsYet', 'No draws yet, check back soon')}
          </div>
        </Card>
      )}
      <ul className='space-y-4'>
        {drawDatasList.map((drawData) => {
          const drawId = drawData.draw.drawId
          return (
            <PastPrizeListItem
              key={`past-prize-list-${drawId}-${prizeDistributor.id()}`}
              drawData={drawData}
              prizeDistributor={prizeDistributor}
              token={prizePoolTokens.token}
              ticket={prizePoolTokens.ticket}
              claimedAmount={claimedAmountsData?.claimedAmounts[drawId]}
              normalizedBalance={normalizedBalancesData?.normalizedBalances[drawId]}
              drawLock={drawLocks[drawId]}
            />
          )
        })}
      </ul>
    </div>
  )
}

interface PastPrizeListItemProps {
  token: Token
  ticket: Token
  drawData: { draw: Draw; prizeDistribution?: PrizeDistribution }
  prizeDistributor: PrizeDistributor
  claimedAmount: Amount
  normalizedBalance: BigNumber
  drawLock?: DrawLock
}

// Components inside need to account for the case where there is no prizeDistribution
const PastPrizeListItem = (props: PastPrizeListItemProps) => {
  const { ticket, drawData } = props
  const pendingClassName = 'font-bold text-inverse text-xs xs:text-sm opacity-80'
  const { draw, prizeDistribution } = drawData
  const amount = prizeDistribution
    ? roundPrizeAmount(prizeDistribution.prize, ticket.decimals)
    : null

  return (
    <li>
      <ViewPrizesSheetCustomTrigger
        ticket={ticket}
        prizeTier={prizeDistribution}
        Button={({ onClick }) => {
          return (
            <button
              onClick={onClick}
              className={classNames(
                'flex flex-row justify-between w-full bg-white dark:bg-pt-purple-dark dark:bg-opacity-50 rounded-lg p-4',
                'hover:shadow-lg hover:bg-opacity-100'
              )}
            >
              <div className='flex flex-col xs:flex-row justify-between w-full'>
                <div className='flex flex-col sm:w-2/3'>
                  <span className='flex items-start'>
                    <DrawId
                      className='uppercase font-bold text-accent-2 opacity-50 text-xs xs:text-sm mr-2'
                      draw={draw}
                    />
                    <DrawDate
                      className='uppercase font-bold text-accent-1 opacity-80 text-xs xs:text-sm'
                      draw={draw}
                    />
                  </span>

                  <ExtraDetailsSection {...props} className='mt-2 text-left' />

                  <PropagatingMessage
                    pendingClassName={pendingClassName}
                    prizeDistribution={prizeDistribution}
                  />
                </div>

                <AmountInPrizes
                  amount={amount}
                  className='hidden xs:flex'
                  numberClassName='font-bold text-inverse text-xs xs:text-sm'
                  textClassName='font-bold text-inverse text-xs xs:text-sm ml-1 opacity-60'
                />
              </div>

              <FeatherIcon
                icon='chevron-right'
                className='text-pt-purple-lighter w-6 h-6 ml-2 mb-auto'
              />
            </button>
          )
        }}
      />
    </li>
  )
}

export const DrawDate = (props: { draw: Draw; className?: string }) => (
  <span className={props.className}>
    {getTimestampStringWithTime(
      props.draw.beaconPeriodStartedAt.toNumber() + props.draw.beaconPeriodSeconds
    )}
  </span>
)

DrawDate.defaultProps = {
  className: 'uppercase font-bold text-inverse opacity-70 text-xs leading-none'
}

const DrawId = (props: { draw: Draw; className?: string }) => (
  <span className={props.className}>#{props.draw.drawId}</span>
)

DrawId.defaultProps = {
  className: 'uppercase font-bold text-inverse mr-2 opacity-50 text-xs leading-none'
}

const PropagatingMessage = (props: {
  pendingClassName: string
  prizeDistribution: PrizeDistribution
}) => {
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
        className='flex items-center'
      >
        <ThemedClipSpinner size={10} className='mr-2' />{' '}
        <span className='uppercase flex items-center'>
          {' '}
          <span className='border-default border-dotted border-b-2'>
            {' '}
            {t('propagating', 'Propagating ...')}{' '}
          </span>
          <FeatherIcon icon='help-circle' className='relative w-4 h-4 text-inverse ml-2' />
        </span>
      </Tooltip>
    </div>
  )
}

const ExtraDetailsSection = (props: { className?: string } & PastPrizeListItemProps) => {
  const {
    claimedAmount,
    prizeDistributor,
    className,
    ticket,
    drawLock,
    drawData,
    normalizedBalance
  } = props
  const { draw } = drawData
  const usersAddress = useUsersAddress()
  const storedDrawResults = useUsersStoredDrawResults(usersAddress, prizeDistributor)
  const { t } = useTranslation()
  const drawLockCountdown = useTimeUntil(drawLock?.endTimeSeconds.toNumber())

  const drawResults = storedDrawResults?.[usersAddress]

  const drawResult = drawResults?.[draw.drawId]
  const amountUnformatted = claimedAmount?.amountUnformatted
  const userHasClaimed = amountUnformatted && !amountUnformatted?.isZero()
  const userHasAmountToClaim = drawResult && !drawResult.totalValue.isZero()
  const userWasNotEligible = normalizedBalance && normalizedBalance.isZero()
  const noPrizes = usersAddress && !userHasClaimed && !userHasAmountToClaim && drawResult
  const unclaimed = usersAddress && !userHasClaimed && userHasAmountToClaim

  const messageHeightClassName = 'h-6'

  if (drawLockCountdown?.secondsLeft) {
    const { days, hours, minutes } = drawLockCountdown
    const thereIsWeeks = false
    const thereIsDays = thereIsWeeks || days > 0
    const thereIsHours = thereIsDays || hours > 0
    const thereIsMinutes = thereIsHours || minutes > 0
    return (
      <div
        className={classNames('text-inverse flex leading-tight', messageHeightClassName, className)}
      >
        <FeatherIcon icon='lock' className='w-4 h-4 my-auto mr-2' />
        <span>
          {t('drawNumber', 'Draw #{{number}}', { number: draw.drawId })}{' '}
          {t('unlocksIn', 'unlocks in')}
          <CountdownString
            weeks={0}
            className='ml-1'
            {...drawLockCountdown}
            hideHours={thereIsWeeks}
            hideMinutes={thereIsDays}
            hideSeconds={thereIsMinutes}
          />
        </span>
      </div>
    )
  } else if (noPrizes || unclaimed) {
    return <div className={classNames('text-inverse', messageHeightClassName, className)} />
  } else if (usersAddress && claimedAmount && !claimedAmount.amountUnformatted.isZero()) {
    const { amountPretty } = claimedAmount
    return (
      <div className={classNames(messageHeightClassName, className)}>
        <span className='text-accent-1'>{t('claimed', 'Claimed')}</span>
        <span className='ml-2 font-bold'>{amountPretty}</span>
        <span className='ml-2 font-bold'>{ticket.symbol}</span>
      </div>
    )
  } else if (usersAddress && normalizedBalance && userWasNotEligible) {
    return (
      <div className={classNames(messageHeightClassName, className)}>
        <span className='text-accent-1 opacity-50'>{t('notEligible', 'Not eligible')}</span>
      </div>
    )
  } else {
    return <div className={classNames(messageHeightClassName, className)} />
  }
}

const PastDrawsListHeader = (props: { className?: string }) => {
  const { t } = useTranslation()
  return <div className={classNames(props.className, 'pt-4 pb-2')}></div>
}

const LoadingRow = () => <div className='w-full rounded-lg animate-pulse bg-card h-24' />
