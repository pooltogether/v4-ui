import React from 'react'

import { usePrizePoolBySelectedChainId } from '@hooks/v4/PrizePool/usePrizePoolBySelectedChainId'
import { PagePadding } from '@components/Layout/PagePadding'
import { useUsersAddress } from '@hooks/useUsersAddress'
import { PastDrawsList } from './PastDrawsList'
import { usePrizeDistributorBySelectedChainId } from '@hooks/v4/PrizeDistributor/usePrizeDistributorBySelectedChainId'
import { PrizeDistributor, PrizePool } from '@pooltogether/v4-client-js'
import { useTranslation } from 'react-i18next'
import { SelectAppChainIdModal } from '@components/SelectAppChainIdModal'
import { MultiDrawsCard } from './MultiDrawsCard'
import classNames from 'classnames'
import { LoadingCard } from './MultiDrawsCard/LoadingCard'
import { LockedDrawsCard } from './MultiDrawsCard/LockedDrawsCard'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useLockedDrawIdsWatcher } from '@hooks/v4/PrizeDistributor/useLockedDrawIdsWatcher'

export const PRIZE_UI_STATES = {
  initialState: 'initialState',
  checkingForPrizes: 'checkingForPrizes',
  won: 'won',
  didNotWin: 'didNotWin'
}

export const PrizesUI = () => {
  useLockedDrawIdsWatcher()
  const prizeDistributor = usePrizeDistributorBySelectedChainId()
  const prizePool = usePrizePoolBySelectedChainId()
  const usersAddress = useUsersAddress()
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)

  if (!Boolean(prizeDistributor) || !prizePool || !isPrizePoolTokensFetched) {
    return (
      <PagePadding className='flex flex-col'>
        <CheckForPrizesOnNetwork
          prizePool={prizePool}
          prizeDistributor={prizeDistributor}
          className='mb-6'
        />
        <LoadingCard />
      </PagePadding>
    )
  }

  if (!usersAddress) {
    return (
      <PagePadding className='flex flex-col'>
        <CheckForPrizesOnNetwork
          prizePool={prizePool}
          prizeDistributor={prizeDistributor}
          className='mb-6'
        />
        <LockedDrawsCard
          prizeDistributor={prizeDistributor}
          token={prizePoolTokens?.token}
          ticket={prizePoolTokens?.ticket}
        />
        <PastDrawsList prizeDistributor={prizeDistributor} prizePool={prizePool} className='mt-8' />
      </PagePadding>
    )
  }

  return (
    <>
      <PagePadding className='flex flex-col'>
        <CheckForPrizesOnNetwork
          prizePool={prizePool}
          prizeDistributor={prizeDistributor}
          className='mb-6'
        />
        <MultiDrawsCard prizePool={prizePool} prizeDistributor={prizeDistributor} />
        <PastDrawsList prizeDistributor={prizeDistributor} prizePool={prizePool} className='mt-8' />
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
      className={classNames(
        'font-semibold flex items-center justify-center text-xs xs:text-sm',
        className
      )}
    >
      <span className='uppercase text-pt-purple-dark text-opacity-60 dark:text-pt-purple-lighter'>
        {t('prizesOn', 'Prizes on')}
      </span>
      <SelectAppChainIdModal className='network-dropdown ml-1 xs:ml-2' />
    </div>
  )
}
