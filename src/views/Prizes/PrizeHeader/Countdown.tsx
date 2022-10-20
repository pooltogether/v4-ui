import { UpcomingPerDrawPrizeValue } from '@components/PrizePoolNetwork/UpcomingPerDrawPrizeValue'
import { Time } from '@components/Time'
import { TransparentDiv } from '@components/TransparentDiv'
import { useTimeUntil } from '@hooks/useTimeUntil'
import { useDrawLocks } from '@hooks/v4/PrizeDistributor/useDrawLocks'
import { useLockedPartialDrawDatas } from '@hooks/v4/PrizeDistributor/useLockedPartialDrawDatas'
import { usePropagatingDraws } from '@hooks/v4/PrizeDistributor/usePropagatingDraws'
import { useUsersUnclaimedDrawDatas } from '@hooks/v4/PrizeDistributor/useUsersUnclaimedDrawDatas'
import { CheckedState, PrizePageState, usePrizePageState } from '@hooks/v4/usePrizePageState'
import { ThemedClipSpinner, Tooltip } from '@pooltogether/react-components'
import { PrizeDistributor } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'

export const Countdown = (props: {
  className?: string
  usersAddress: string
  prizeDistributor: PrizeDistributor
  prizePageState: PrizePageState
  checkedState: CheckedState
}) => {
  const { className } = props
  return (
    <div className={classNames(className, 'h-16')}>
      <Content {...props} />
    </div>
  )
}

export const Content = (props: {
  usersAddress: string
  prizeDistributor: PrizeDistributor
  prizePageState: PrizePageState
  checkedState: CheckedState
}) => {
  const { usersAddress, prizeDistributor, prizePageState, checkedState } = props

  if (prizePageState === PrizePageState.loading) {
    return <Loading />
  } else if (prizePageState === PrizePageState.drawsToCheck) {
    return <DrawsToCheck usersAddress={usersAddress} prizeDistributor={prizeDistributor} />
  } else if (prizePageState === PrizePageState.lockedDraws) {
    return <LockedDraws prizeDistributor={prizeDistributor} />
  } else if (prizePageState === PrizePageState.propagatingDraws) {
    return <PropagatingDraws prizeDistributor={prizeDistributor} />
  }
  return <NoDraws />
}

const Loading = () => {
  return <div></div>
}

const DrawsToCheck = (props: { usersAddress: string; prizeDistributor: PrizeDistributor }) => {
  const { usersAddress, prizeDistributor } = props
  const { data: unclaimedDrawDatasData, isFetched: isUnclaimedDrawDataFetched } =
    useUsersUnclaimedDrawDatas(usersAddress, prizeDistributor)
  const numberOfDraws = Object.keys(unclaimedDrawDatasData[usersAddress]).length
  return <div className='text-3xl font-bold'>{numberOfDraws} draws to check!</div>
}

const PropagatingDraws = (props: { prizeDistributor: PrizeDistributor }) => {
  const { t } = useTranslation()
  return (
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
  )
}

const LockedDraws = (props: { prizeDistributor: PrizeDistributor }) => {
  const { prizeDistributor } = props
  const lockedPartialDrawDatas = useLockedPartialDrawDatas(prizeDistributor)
  const lockedPartialDrawDatasList = lockedPartialDrawDatas
    ? Object.values(lockedPartialDrawDatas)
    : null
  const firstLockDrawId = lockedPartialDrawDatasList?.[0]?.draw.drawId
  const { t } = useTranslation()

  const { data: drawLocks, isFetched: isDrawLocksFetched } = useDrawLocks()

  const drawLock = drawLocks?.[firstLockDrawId]
  const { secondsLeft } = useTimeUntil(drawLock?.endTimeSeconds.toNumber())

  if (!isDrawLocksFetched) return null
  if (!lockedPartialDrawDatasList) return null
  if (lockedPartialDrawDatasList.length === 0) {
    return (
      <div className='flex flex-col text-center mx-auto'>
        <span className='text-lg text-inverse'>{t('noDrawsToCheckNoDeposits')}</span>
        <span className=''>{t('comeBackSoon')}</span>
      </div>
    )
  }

  return (
    <Time
      seconds={secondsLeft}
      backgroundColorClassName={'bg-pt-purple-lighter bg-opacity-20'}
      unitsColorClassName={'text-pt-purple-lighter text-opacity-40'}
    />
  )
}

const NoDraws = () => {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col text-center mx-auto xs:mx-0 xs:text-left'>
      <span className='text-lg font-bold text-inverse text-center'>
        {t('noDrawsToCheckNoDeposits')}
      </span>
      <span className='text-center'>{t('comeBackSoon')}</span>
    </div>
  )
}
