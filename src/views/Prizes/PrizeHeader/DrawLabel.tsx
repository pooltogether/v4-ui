import { UpcomingPerDrawPrizeValue } from '@components/PrizePoolNetwork/UpcomingPerDrawPrizeValue'
import { Time } from '@components/Time'
import { TransparentDiv } from '@components/TransparentDiv'
import { useTimeUntil } from '@hooks/useTimeUntil'
import { useDrawLocks } from '@hooks/v4/PrizeDistributor/useDrawLocks'
import { useLockedPartialDrawDatas } from '@hooks/v4/PrizeDistributor/useLockedPartialDrawDatas'
import { usePropagatingDraws } from '@hooks/v4/PrizeDistributor/usePropagatingDraws'
import { useUsersUnclaimedDrawDatas } from '@hooks/v4/PrizeDistributor/useUsersUnclaimedDrawDatas'
import { CheckedState, PrizePageState, usePrizePageState } from '@hooks/v4/usePrizePageState'
import { PrizeDistributor } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import { MultipleDrawIds } from '../MultiDrawsCard/MultipleDrawDetails'
import { MultipleDrawsDate } from '../MultiDrawsCard/MultipleDrawsDate'

export const DrawLabel = (props: {
  className?: string
  usersAddress: string
  prizeDistributor: PrizeDistributor
  prizePageState: PrizePageState
  checkedState: CheckedState
}) => {
  const { className } = props
  return (
    <div className={classNames(className, 'text-center text-sm sm:text-lg opacity-75')}>
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
  return <></>
}

const DrawsToCheck = (props: { usersAddress: string; prizeDistributor: PrizeDistributor }) => {
  const { usersAddress, prizeDistributor } = props
  const { data: unclaimedDrawDatasData, isFetched: isUnclaimedDrawDataFetched } =
    useUsersUnclaimedDrawDatas(usersAddress, prizeDistributor)

  return (
    <>
      <MultipleDrawIds partialDrawDatas={unclaimedDrawDatasData[usersAddress]} />
      <MultipleDrawsDate partialDrawDatas={unclaimedDrawDatasData[usersAddress]} />
    </>
  )
}

const PropagatingDraws = (props: { prizeDistributor: PrizeDistributor }) => {
  const { prizeDistributor } = props
  const { data: propagatingDraws } = usePropagatingDraws(prizeDistributor)
  return (
    <>
      <MultipleDrawIds partialDrawDatas={propagatingDraws} />
      <MultipleDrawsDate partialDrawDatas={propagatingDraws} />
    </>
  )
}

const LockedDraws = (props: { prizeDistributor: PrizeDistributor }) => {
  const { prizeDistributor } = props
  const lockedPartialDrawDatas = useLockedPartialDrawDatas(prizeDistributor)

  return (
    <>
      <MultipleDrawIds partialDrawDatas={lockedPartialDrawDatas} />
      <MultipleDrawsDate partialDrawDatas={lockedPartialDrawDatas} />
    </>
  )
}

const NoDraws = () => null
