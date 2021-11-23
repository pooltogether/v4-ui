import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { Card, Time } from '@pooltogether/react-components'
import React from 'react'
import classNames from 'classnames'
import { Token } from '@pooltogether/hooks'
import { useTranslation } from 'react-i18next'

import { LoadingCard } from './LoadingCard'
import { StaticPrizeVideoBackground } from './StaticPrizeVideoBackground'
import { useLockedDrawDatas } from 'lib/hooks/Tsunami/PrizeDistributor/useLockedDrawDatas'
import { MultipleDrawIds, TotalPrizes } from './MultipleDrawDetails'
import { DrawData } from 'lib/types/v4'
import { MultipleDrawsDate } from './MultipleDrawsDate'
import { MultiDrawsPrizeTiersTrigger } from './MultiDrawsPrizeTiersTrigger'
import { useTimeUntil } from 'lib/hooks/useTimeUntil'
import { useDrawLocks } from 'lib/hooks/Tsunami/PrizeDistributor/useDrawLocks'

export const LockedDrawsCard = (props: {
  prizeDistributor: PrizeDistributor
  token: Token
  ticket: Token
}) => {
  const { prizeDistributor, ticket, token } = props
  const lockedDrawDatas = useLockedDrawDatas(prizeDistributor)

  if (!lockedDrawDatas) {
    return <LoadingCard />
  }

  if (Object.keys(lockedDrawDatas).length === 0) {
    return <NoDrawsCard />
  }

  return (
    <Card className='draw-card' paddingClassName=''>
      <StaticPrizeVideoBackground className='absolute inset-0' />
      <LockedDrawDetails
        drawDatas={lockedDrawDatas}
        token={token}
        ticket={ticket}
        className='absolute top-4 xs:top-8 left-0 px-4 xs:px-8'
      />
      <LockedDrawsCountdown
        drawDatas={lockedDrawDatas}
        className='absolute bottom-4 left-0 right-0 xs:top-14 xs:bottom-auto xs:left-auto xs:right-auto px-4 xs:px-8 flex justify-center'
      />
    </Card>
  )
}

const LockedDrawDetails = (props: {
  className?: string
  token: Token
  ticket: Token
  drawDatas: {
    [drawId: number]: DrawData
  }
}) => {
  const { className, drawDatas, token, ticket } = props
  return (
    <div
      className={classNames(
        className,
        'flex flex-col xs:flex-row justify-between leading-none xs:w-full'
      )}
    >
      <div>
        <MultipleDrawIds drawDatas={drawDatas} />
        <MultipleDrawsDate drawDatas={drawDatas} />
      </div>
      <span className='flex xs:flex-col flex-col-reverse items-start xs:items-end '>
        <MultiDrawsPrizeTiersTrigger className='mt-2 xs:mt-0' token={token} drawDatas={drawDatas} />
        <TotalPrizes className='mt-2' token={token} drawDatas={drawDatas} />
      </span>
      {/* <FeatherIcon name='lock' className='text-white w-10 h-10 stroke-current' /> */}
    </div>
  )
}

const LockedDrawsCountdown = (props: {
  drawDatas: { [drawId: number]: DrawData }
  className?: string
}) => {
  const { className, drawDatas } = props
  const { data: drawLocks, isFetched: isDrawLocksFetched } = useDrawLocks()

  const drawLock = drawLocks?.[Object.keys(drawDatas)[0]]
  const { secondsLeft } = useTimeUntil(drawLock?.endTimeSeconds.toNumber())

  if (!isDrawLocksFetched) {
    return <div className='bg-new-modal animate-pulse' />
  }

  return (
    <div className={classNames(className)}>
      <Time seconds={secondsLeft} className='' />
    </div>
  )
}

const NoDrawsCard = (props: { className?: string }) => {
  const { className } = props
  const { t } = useTranslation()
  return (
    <div className={classNames(className, 'draw-card purple-radial-gradient')}>
      <div className='absolute inset-0 flex flex-col justify-center text-center px-8'>
        <span className='text-lg text-inverse'>{t('noDrawsToCheckNoDeposits')}</span>
        <span className=''>{t('comeBackSoon')}</span>
      </div>
    </div>
  )
}
