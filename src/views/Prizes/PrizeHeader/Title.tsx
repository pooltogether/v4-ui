import { CurrencyValue } from '@components/CurrencyValue'
import { NextDrawId } from '@components/PrizePoolNetwork/NextDrawId'
import { UpcomingPerDrawPrizeValue } from '@components/PrizePoolNetwork/UpcomingPerDrawPrizeValue'
import { usePrizeDistributorToken } from '@hooks/v4/PrizeDistributor/usePrizeDistributorToken'
import { useUsersUnclaimedDrawDatas } from '@hooks/v4/PrizeDistributor/useUsersUnclaimedDrawDatas'
import { CheckedState, PrizePageState } from '@hooks/v4/usePrizePageState'
import { LoadingDots } from '@pooltogether/react-components'
import { PrizeDistributor } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import { ethers } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { Trans, useTranslation } from 'next-i18next'
import { ValueOfUncheckedPrizes } from '../../../components/PrizePoolNetwork/ValueOfUncheckedPrizes'
import { usePrizePoolByChainId } from '../../../hooks/v4/PrizePool/usePrizePoolByChainId'
import { usePrizePoolExpectedPrizes } from '../../../hooks/v4/PrizePool/usePrizePoolExpectedPrizes'
import { useAllLatestDrawWinnersInfo } from '../../../hooks/v4/useDrawWinnersInfo'

export const Title = (props: {
  className?: string
  usersAddress: string
  prizeDistributor: PrizeDistributor
  prizePageState: PrizePageState
  checkedState: CheckedState
}) => {
  const { className } = props
  return (
    <div
      className={classNames(
        className,
        'text-center font-semibold text-2xl xs:text-4xl sm:text-7xl lg:text-8xl leading-none'
      )}
    >
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
    return <Loading />
  }
  return <NoDraws prizeDistributor={prizeDistributor} />
}

const Loading = () => {
  return <LoadingDots />
}

const DrawsToCheck = (props: { usersAddress: string; prizeDistributor: PrizeDistributor }) => (
  <Trans
    i18nKey='amountInPrizes'
    components={{ b: <b className='text-flashy' />, amount: <TotalPrizes {...props} /> }}
  />
)

const TotalPrizes = (props: { usersAddress: string; prizeDistributor: PrizeDistributor }) => {
  const { usersAddress, prizeDistributor } = props
  const { data: unclaimedDrawDatasData, isFetched: isUnclaimedDrawDataFetched } =
    useUsersUnclaimedDrawDatas(usersAddress, prizeDistributor)
  const drawDatas = unclaimedDrawDatasData?.[usersAddress]

  if (!isUnclaimedDrawDataFetched || !drawDatas) {
    return null
  }

  return <ValueOfUncheckedPrizes drawDatas={drawDatas} prizeDistributor={prizeDistributor} />
}

const LockedDraws = (props: { prizeDistributor: PrizeDistributor }) => (
  <Trans
    i18nKey='amountInPrizesUnlockingSoon'
    components={{ b: <b className='text-flashy' />, amount: <UpcomingPerDrawPrizeValue /> }}
  />
)

const NoDraws = (props: { prizeDistributor: PrizeDistributor }) => {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col'>
      <span>
        <Trans i18nKey='drawId' components={{ id: <NextDrawId /> }} />
      </span>
      <span>{t('closingSoon')}</span>
    </div>
  )
}
