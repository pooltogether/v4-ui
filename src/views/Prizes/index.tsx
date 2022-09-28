import { PagePadding } from '@components/Layout/PagePadding'
import { SelectAppChainIdModal } from '@components/SelectAppChainIdModal'
import { CardTitle } from '@components/Text/CardTitle'
import { useLockedDrawIdsWatcher } from '@hooks/v4/PrizeDistributor/useLockedDrawIdsWatcher'
import { usePrizeDistributorBySelectedChainId } from '@hooks/v4/PrizeDistributor/usePrizeDistributorBySelectedChainId'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { PrizeDistributor, PrizePool } from '@pooltogether/v4-client-js'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { EarnRewardsCard } from '@views/Account/Rewards/EarnRewardsCard'
import { RewardsCard } from '@views/Account/Rewards/RewardsCard'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { MultiDrawsCard } from './MultiDrawsCard'
import { LoadingCard } from './MultiDrawsCard/LoadingCard'
import { LockedDrawsCard } from './MultiDrawsCard/LockedDrawsCard'
import { PastDrawsList } from './PastDrawsList'

export const PRIZE_UI_STATES = {
  initialState: 'initialState',
  checkingForPrizes: 'checkingForPrizes',
  won: 'won',
  didNotWin: 'didNotWin'
}

export const PrizesUI = () => {
  useLockedDrawIdsWatcher()
  const prizeDistributor = usePrizeDistributorBySelectedChainId()
  const prizePool = useSelectedPrizePool()
  const usersAddress = useUsersAddress()
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)

  if (!Boolean(prizeDistributor) || !prizePool || !isPrizePoolTokensFetched) {
    return (
      <PagePadding className='flex flex-col space-y-4'>
        <CheckForPrizesOnNetwork prizePool={prizePool} prizeDistributor={prizeDistributor} />
        <LoadingCard />
      </PagePadding>
    )
  }

  if (!usersAddress) {
    return (
      <PagePadding className='flex flex-col space-y-8'>
        <div className='flex flex-col space-y-4'>
          <CheckForPrizesOnNetwork prizePool={prizePool} prizeDistributor={prizeDistributor} />
          <LockedDrawsCard
            prizeDistributor={prizeDistributor}
            token={prizePoolTokens?.token}
            ticket={prizePoolTokens?.ticket}
          />
        </div>
        <EarnRewardsCard />
        <PastDrawsList prizeDistributor={prizeDistributor} prizePool={prizePool} className='mt-8' />
      </PagePadding>
    )
  }

  return (
    <>
      <PagePadding className='flex flex-col space-y-8'>
        <div className='flex flex-col space-y-4'>
          <CheckForPrizesOnNetwork prizePool={prizePool} prizeDistributor={prizeDistributor} />
          <MultiDrawsCard prizePool={prizePool} prizeDistributor={prizeDistributor} />
        </div>
        <RewardsCard />
        <PastDrawsList prizeDistributor={prizeDistributor} prizePool={prizePool} />
      </PagePadding>
    </>
  )
}
const CheckForPrizesOnNetwork = (props: {
  className?: string
  prizePool: PrizePool
  prizeDistributor: PrizeDistributor
}) => {
  const { className } = props
  const { t } = useTranslation()
  return (
    <div
      className={classNames('font-semibold flex flex-col space-y-2 text-xs xs:text-sm', className)}
    >
      <CardTitle title='Prizes for Prize Pool' />
      <SelectAppChainIdModal className='network-dropdown' />
    </div>
  )
}
