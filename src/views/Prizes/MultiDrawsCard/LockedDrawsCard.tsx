import { Draw, PrizeDistribution, PrizeDistributor } from '@pooltogether/v4-js-client'
import { Card, ThemedClipSpinner, Tooltip } from '@pooltogether/react-components'
import FeatherIcon from 'feather-icons-react'
import React from 'react'
import classNames from 'classnames'
import { Token } from '@pooltogether/hooks'
import { useTranslation } from 'react-i18next'

import { LoadingCard } from './LoadingCard'
import { StaticPrizeVideoBackground } from './StaticPrizeVideoBackground'
import { useLockedPartialDrawDatas } from '@hooks/v4/PrizeDistributor/useLockedPartialDrawDatas'
import { MultipleDrawIds, TotalPrizes } from './MultipleDrawDetails'
import { DrawData } from '../../../interfaces/v4'
import { MultipleDrawsDate } from './MultipleDrawsDate'
import { MultiDrawsPrizeTiersTrigger } from './MultiDrawsPrizeTiersTrigger'
import { useTimeUntil } from '@hooks/useTimeUntil'
import { useDrawLocks } from '@hooks/v4/PrizeDistributor/useDrawLocks'
import { usePropagatingDraws } from '@hooks/v4/PrizeDistributor/usePropagatingDraws'
import { Time } from '@components/Time'

export const LockedDrawsCard = (props: {
  prizeDistributor: PrizeDistributor
  token: Token
  ticket: Token
}) => {
  const { prizeDistributor, ticket, token } = props
  const lockedPartialDrawDatas = useLockedPartialDrawDatas(prizeDistributor)
  const { data: propagatingDraws, isFetched: isPropagatingDrawsFetched } =
    usePropagatingDraws(prizeDistributor)

  if (!lockedPartialDrawDatas || !isPropagatingDrawsFetched) {
    return <LoadingCard />
  }

  if (Object.keys(propagatingDraws).length > 0) {
    return <PropagatingDrawsCard draws={propagatingDraws} />
  }

  const lockedPartialDrawDatasList = Object.values(lockedPartialDrawDatas)
  if (lockedPartialDrawDatasList.length === 0) {
    return <NoDrawsCard />
  }

  return (
    <Card className='draw-card' paddingClassName=''>
      <StaticPrizeVideoBackground className='absolute inset-0' />
      <LockedDrawDetails
        partialDrawDatas={lockedPartialDrawDatas}
        token={token}
        ticket={ticket}
        className='absolute top-4 xs:top-8 left-0 px-4 xs:px-8'
      />
      <LockedDrawsCountdown
        firstLockDrawId={lockedPartialDrawDatasList[0].draw.drawId}
        className='absolute bottom-4 left-0 right-0 xs:top-14 xs:bottom-auto xs:left-auto xs:right-auto px-4 xs:px-8 flex justify-center'
      />
    </Card>
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
    <div
      className={classNames(
        className,
        'flex flex-col xs:flex-row justify-between leading-none xs:w-full'
      )}
    >
      <div>
        <MultipleDrawIds partialDrawDatas={partialDrawDatas} />
        <MultipleDrawsDate partialDrawDatas={partialDrawDatas} />
      </div>
      <span className='flex xs:flex-col flex-col-reverse items-start xs:items-end '>
        <MultiDrawsPrizeTiersTrigger
          className='mt-2 xs:mt-0'
          ticket={ticket}
          drawDatas={fullDrawDraws}
        />
        <TotalPrizes className='mt-2' token={token} drawDatas={fullDrawDraws} />
      </span>
    </div>
  )
}

const LockedDrawsCountdown = (props: { firstLockDrawId: number; className?: string }) => {
  const { className, firstLockDrawId } = props
  const { data: drawLocks, isFetched: isDrawLocksFetched } = useDrawLocks()

  const drawLock = drawLocks?.[firstLockDrawId]
  const { secondsLeft } = useTimeUntil(drawLock?.endTimeSeconds.toNumber())

  if (!isDrawLocksFetched) {
    return <div className='bg-new-modal animate-pulse' />
  }

  return (
    <div className={classNames(className)}>
      <Time
        seconds={secondsLeft}
        backgroundColorClassName={'bg-pt-purple-lighter bg-opacity-20'}
        unitsColorClassName={'text-pt-purple-lighter text-opacity-40'}
      />
    </div>
  )
}

const NoDrawsCard = (props: { className?: string }) => {
  const { t } = useTranslation()
  return (
    <Card className='draw-card' paddingClassName=''>
      <StaticPrizeVideoBackground className='absolute inset-0' />
      <div className='absolute bottom-4 left-0 right-0 xs:top-8 xs:bottom-auto xs:left-auto xs:right-auto px-4 xs:px-8 flex flex-col text-center xs:text-left'>
        <span className='text-lg text-inverse'>{t('noDrawsToCheckNoDeposits')}</span>
        <span className=''>{t('comeBackSoon')}</span>
      </div>
    </Card>
  )
}

const PropagatingDrawsCard = (props: {
  draws: { [chainId: number]: { draw: Draw } }
  className?: string
}) => {
  const { draws } = props
  const { t } = useTranslation()
  return (
    <Card className='draw-card' paddingClassName=''>
      <StaticPrizeVideoBackground className='absolute inset-0' />
      <div
        className={classNames(
          'flex flex-col xs:flex-row justify-between leading-none xs:w-full absolute top-4 xs:top-8 left-0 px-4 xs:px-8'
        )}
      >
        <div>
          <MultipleDrawIds partialDrawDatas={draws} />
          <MultipleDrawsDate partialDrawDatas={draws} />
        </div>
      </div>
      <div className='absolute bottom-6 left-0 right-0 xs:top-14 xs:bottom-auto xs:left-auto xs:right-auto px-4 xs:px-8 flex flex-col text-center'>
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
    </Card>
  )
}
