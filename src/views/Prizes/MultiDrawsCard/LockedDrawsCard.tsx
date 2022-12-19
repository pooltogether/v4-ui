import { useDrawLocks } from '@hooks/v4/PrizeDistributor/useDrawLocks'
import { useLockedPartialDrawDatas } from '@hooks/v4/PrizeDistributor/useLockedPartialDrawDatas'
import { usePropagatingDraws } from '@hooks/v4/PrizeDistributor/usePropagatingDraws'
import { Token } from '@pooltogether/hooks'
import {
  ThemedClipSpinner,
  TimeDisplay,
  Tooltip,
  useCountdown
} from '@pooltogether/react-components'
import { Draw, PrizeDistribution, PrizeDistributor } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { DrawData } from '../../../interfaces/v4'
import { MultipleDrawIds, TotalPrizes } from './MultipleDrawDetails'
import { MultipleDrawsDate } from './MultipleDrawsDate'
import { PrizeAnimationCard } from './PrizeAnimationCard'

export const LockedDrawsCard: React.FC<{
  prizeDistributor: PrizeDistributor
  token: Token
  ticket: Token
}> = (props) => (
  <PrizeAnimationCard>
    <LockedDrawsCardContent {...props} />
  </PrizeAnimationCard>
)

export const LockedDrawsCardContent: React.FC<{
  prizeDistributor: PrizeDistributor
  token: Token
  ticket: Token
}> = (props) => {
  const { prizeDistributor, ticket, token } = props
  const lockedPartialDrawDatas = useLockedPartialDrawDatas(prizeDistributor)
  const { data: propagatingDraws, isFetched: isPropagatingDrawsFetched } =
    usePropagatingDraws(prizeDistributor)

  if (!lockedPartialDrawDatas || !isPropagatingDrawsFetched) {
    return <ThemedClipSpinner />
  }

  if (Object.keys(propagatingDraws).length > 0) {
    return <PropagatingDrawsContent draws={propagatingDraws} />
  }

  const lockedPartialDrawDatasList = Object.values(lockedPartialDrawDatas)
  if (lockedPartialDrawDatasList.length === 0) {
    return <NoDrawsContent />
  }

  return (
    <>
      <LockedDrawsHeader partialDrawDatas={lockedPartialDrawDatas} />
      <div className='flex flex-col-reverse justify-between h-full xs:flex-row'>
        <LockedDrawsCountdown
          prizeDistributor={prizeDistributor}
          firstLockDrawId={lockedPartialDrawDatasList[0].draw.drawId}
          className='mx-auto xs:mx-0'
        />
        <LockedDrawDetails
          partialDrawDatas={lockedPartialDrawDatas}
          token={token}
          ticket={ticket}
          className='mt-0 xs:-mt-8'
        />
      </div>
    </>
  )
}

const LockedDrawsHeader: React.FC<{
  className?: string
  partialDrawDatas: {
    [drawId: number]: {
      draw: Draw
      prizeDistribution?: PrizeDistribution
    }
  }
}> = (props) => {
  return (
    <div className={classNames(props.className)}>
      <MultipleDrawIds partialDrawDatas={props.partialDrawDatas} />
      <MultipleDrawsDate partialDrawDatas={props.partialDrawDatas} />
    </div>
  )
}

const LockedDrawDetails = (props: {
  className?: string
  token: Token
  ticket: Token
  partialDrawDatas: {
    [drawId: number]: {
      draw: Draw
      prizeDistribution?: PrizeDistribution
    }
  }
}) => {
  const { className, partialDrawDatas, token, ticket } = props

  const fullDrawDraws: { [drawId: number]: DrawData } = {}
  Object.keys(partialDrawDatas).forEach((_drawId) => {
    const drawId = Number(_drawId)
    const partialDrawData = partialDrawDatas[drawId]
    if (partialDrawData.prizeDistribution) {
      fullDrawDraws[drawId] = {
        draw: partialDrawData.draw,
        prizeDistribution: partialDrawData.prizeDistribution
      }
    }
  })

  return (
    <div className={classNames(className, 'flex flex-col leading-none items-start')}>
      <span className='flex xs:flex-col flex-col-reverse items-start xs:items-end '>
        {/* <MultiDrawsPrizeTiersTrigger
          className='mt-2 xs:mt-0'
          ticket={ticket}
          drawDatas={fullDrawDraws}
        /> */}
        <TotalPrizes className='mt-2' token={token} drawDatas={fullDrawDraws} />
      </span>
    </div>
  )
}

const LockedDrawsCountdown = (props: {
  prizeDistributor: PrizeDistributor
  firstLockDrawId: number
  className?: string
}) => {
  const { className, prizeDistributor, firstLockDrawId } = props
  const { data: drawLocks, isFetched: isDrawLocksFetched } = useDrawLocks()

  const drawLock = drawLocks?.find(
    (drawLock) =>
      drawLock.drawId === firstLockDrawId && drawLock.prizeDistributorId === prizeDistributor.id()
  )
  const { seconds, minutes, hours, days } = useCountdown(drawLock?.endTimeSeconds.toNumber())

  if (!isDrawLocksFetched) {
    return <div className='bg-new-modal animate-pulse' />
  }

  return (
    <div className={classNames(className)}>
      <TimeDisplay hideDays seconds={seconds} minutes={minutes} hours={hours} days={days} />
    </div>
  )
}

const NoDrawsContent = (props: { className?: string }) => {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col justify-end h-full xs:flex-row xs:justify-start'>
      <div className='flex flex-col text-center mx-auto xs:mx-0 xs:text-left'>
        <span className='text-lg text-inverse'>{t('noDrawsToCheckNoDeposits')}</span>
        <span className=''>{t('comeBackSoon')}</span>
      </div>
    </div>
  )
}

const PropagatingDrawsContent = (props: {
  draws: { [chainId: number]: { draw: Draw } }
  className?: string
}) => {
  const { draws } = props
  const { t } = useTranslation()

  return (
    <div className='flex flex-col justify-end h-full xs:flex-row xs:justify-start'>
      <LockedDrawsHeader partialDrawDatas={draws} />
      <div className='flex flex-col text-center mx-auto xs:mx-0 xs:text-left'>
        <div className='font-bold text-white text-xs xs:text-sm opacity-90 mx-auto flex flex-col justify-center'>
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
              <FeatherIcon icon='help-circle' className='relative w-4 h-4 text-white ml-2' />
            </span>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
