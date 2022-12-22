import { ListItem } from '@components/List/ListItem'
import { AmountWonInDraw } from '@components/PrizeDistributor/AmountWonInDraw'
import { useAllPartialDrawDatas } from '@hooks/v4/PrizeDistributor/useAllPartialDrawDatas'
import { useDrawLocks } from '@hooks/v4/PrizeDistributor/useDrawLocks'
import { usePrizeDistributorBySelectedChainId } from '@hooks/v4/PrizeDistributor/usePrizeDistributorBySelectedChainId'
import { useUsersClaimedAmounts } from '@hooks/v4/PrizeDistributor/useUsersClaimedAmounts'
import { useUsersNormalizedBalances } from '@hooks/v4/PrizeDistributor/useUsersNormalizedBalances'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { Amount, Token } from '@pooltogether/hooks'
import {
  ThemedClipSpinner,
  Card,
  Tooltip,
  useCountdown,
  SimpleTimeDisplay
} from '@pooltogether/react-components'
import { Draw, PrizeDistribution, PrizeDistributor, PrizePool } from '@pooltogether/v4-client-js'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { getTimestampStringWithTime } from '@utils/getTimestampString'
import { roundPrizeAmount } from '@utils/roundPrizeAmount'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { HistoricDrawsModal } from './HistoricDrawsModal'

export const HistoricDraws = (props: { className?: string }) => {
  const { className } = props
  const prizeDistributor = usePrizeDistributorBySelectedChainId()
  const prizePool = useSelectedPrizePool()

  const { t } = useTranslation()
  const [drawsToShow, setDrawsToShow] = useState(5)

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
  const {
    data: drawLocks,
    isFetched: isDrawLocksFetched,
    isError: isDrawLocksError
  } = useDrawLocks()
  // Modal state
  const [drawId, setDrawId] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [drawData, setDrawData] = useState<{
    draw: Draw
    prizeDistribution?: PrizeDistribution
  } | null>(null)

  const isDataForCurrentUser =
    usersAddress === normalizedBalancesData?.usersAddress &&
    usersAddress === claimedAmountsData?.usersAddress

  if (
    isDrawLocksError ||
    !isPrizePoolTokensFetched ||
    !isDrawsAndPrizeDistributionsFetched ||
    !isDrawLocksFetched ||
    (usersAddress && !isDataForCurrentUser)
  ) {
    return (
      <div className={classNames('flex flex-col space-x-2', className)}>
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
    <>
      {/* No draws */}
      {drawDatasList.length === 0 && (
        <Card>
          <div className='opacity-70 text-center w-full'>
            {t('noDrawsYet', 'No draws yet, check back soon')}
          </div>
        </Card>
      )}

      {/* Draws list */}
      <ul className='space-y-2 mb-4'>
        {drawDatasList.slice(0, drawsToShow).map((drawData) => (
          <ListItem
            bgClassName='bg-white bg-opacity-25 hover:bg-opacity-100 dark:bg-actually-black dark:bg-opacity-10 dark:hover:bg-opacity-25'
            paddingClassName='py-1 sm:py-3 px-2 sm:px-3'
            key={`pd-historic-draw-${prizeDistributor.id()}-${drawData.draw.drawId}`}
            left={
              <HistoricDrawLeft
                token={prizePoolTokens.token}
                ticket={prizePoolTokens.ticket}
                drawData={drawData}
                drawLock={drawLocks?.find(
                  (drawLock) =>
                    drawLock.drawId === drawData.draw.drawId &&
                    drawLock.prizeDistributorId === prizeDistributor.id()
                )}
                claimedAmount={claimedAmountsData?.claimedAmounts[drawData.draw.drawId]}
                normalizedBalance={normalizedBalancesData?.normalizedBalances[drawData.draw.drawId]}
              />
            }
            onClick={() => {
              setDrawId(drawData.draw.drawId)
              setDrawData(drawData)
              setIsOpen(true)
            }}
            right={
              <div className='font-bold text-xs xs:text-sm flex space-x-2'>
                <span className=''>
                  <AmountWonInDraw
                    prizeDistributor={prizeDistributor}
                    drawId={drawData.draw.drawId}
                  />
                </span>
                <span className='opacity-60 hidden xs:block'>{t('inPrizes', 'in prizes')}</span>
              </div>
            }
          />
        ))}
      </ul>

      {!!drawDatasList && drawDatasList.length > drawsToShow && (
        <button
          className='opacity-70 hover:opacity-100 transition-opacity w-full text-center'
          onClick={() => setDrawsToShow(drawsToShow + 5)}
        >
          {t('showMore')}
        </button>
      )}

      <HistoricDrawsModal
        drawId={drawId}
        prizeDistributor={prizeDistributor}
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        drawData={drawData}
        drawLock={drawLocks[drawId]}
      />
    </>
  )
}

// Components inside need to account for the case where there is no prizeDistribution
const HistoricDrawLeft = (props: {
  token: Token
  ticket: Token
  drawData: { draw: Draw; prizeDistribution?: PrizeDistribution }
  claimedAmount: Amount
  normalizedBalance: BigNumber
  drawLock?: {
    drawId: number
    endTimeSeconds: BigNumber
    prizeDistributorId: string
  }
}) => {
  const { ticket, drawData, drawLock, normalizedBalance, claimedAmount } = props
  const { draw, prizeDistribution } = drawData
  const drawId = draw.drawId
  const amount = prizeDistribution
    ? roundPrizeAmount(prizeDistribution.prize, ticket.decimals)
    : null
  const { t } = useTranslation()

  return (
    <div className='w-full flex flex-col'>
      <span className='flex flex-col space-y-1 space-x-0 xs:flex-row xs:space-y-0 xs:space-x-2'>
        <span>{t('drawNumber', { number: drawId })}</span>
        <DrawDate className='opacity-80 hidden xs:block' draw={draw} />
      </span>
      <BottomSection
        drawData={drawData}
        ticket={ticket}
        drawLock={drawLock}
        normalizedBalance={normalizedBalance}
        claimedAmount={claimedAmount}
      />
    </div>
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

const PropagatingMessage = (props: { prizeDistribution: PrizeDistribution }) => {
  const { t } = useTranslation()

  if (props.prizeDistribution) {
    return null
  }

  return (
    <div className={'font-bold text-xs xs:text-sm opacity-70'}>
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

const BottomSection = (props: {
  className?: string
  ticket: Token
  claimedAmount: Amount
  normalizedBalance: BigNumber
  drawLock?: {
    drawId: number
    endTimeSeconds: BigNumber
    prizeDistributorId: string
  }
  drawData: { draw: Draw; prizeDistribution?: PrizeDistribution }
}) => {
  const { drawData, claimedAmount, className, ticket, drawLock, normalizedBalance } = props
  const usersAddress = useUsersAddress()
  const { t } = useTranslation()
  const { seconds, minutes, hours, days } = useCountdown(drawLock?.endTimeSeconds.toNumber())
  const { prizeDistribution } = drawData

  const userWasNotEligible = normalizedBalance && normalizedBalance.isZero()
  const isLocked = seconds > 0 || minutes > 0 || hours > 0 || days > 0
  const prizeClaimed = usersAddress && claimedAmount && !claimedAmount.amountUnformatted.isZero()

  return (
    <div
      className={classNames(
        'flex flex-col space-x-0 space-y-2 xs:flex-row sm:space-x-2 sm:space-x-4 sm:space-y-0 font-normal text-xs',
        className
      )}
    >
      {/* Propagating */}
      <PropagatingMessage prizeDistribution={prizeDistribution} />

      {/* Countdown */}
      {isLocked && (
        <div className='flex space-x-1 items-center'>
          <FeatherIcon icon='lock' className='w-4 h-4' />
          <span>
            <SimpleTimeDisplay
              seconds={seconds}
              minutes={minutes}
              hours={hours}
              days={days}
              t={t}
            />
          </span>
        </div>
      )}

      {/* Eligibility */}
      {!!usersAddress && (
        <>
          {userWasNotEligible ? (
            <span className='opacity-70'>{t('notEligible', 'Not eligible')}</span>
          ) : prizeClaimed ? (
            <div className='flex flex-row space-x-1 items-center'>
              <span className=''>{t('claimed', 'Claimed')}</span>
              <span className='font-bold'>{claimedAmount?.amountPretty}</span>
              <span className='font-bold'>{ticket.symbol}</span>
            </div>
          ) : (
            <span className='opacity-70'>{t('eligibleToWin', 'Eligible to win')}</span>
          )}
        </>
      )}
    </div>
  )
}

const LoadingRow = () => <div className='w-full rounded-lg animate-pulse bg-card h-24' />
