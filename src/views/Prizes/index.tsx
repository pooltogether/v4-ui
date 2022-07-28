import React from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { PrizeDistributorV2, PrizePool } from '@pooltogether/v4-client-js'
import { PoolPartySeason1CTA } from '@components/PoolPartySeason1CTA'
import { PagePadding } from '@components/Layout/PagePadding'
import { SelectPrizePoolModal } from '@components/SelectPrizePoolModal'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { MultiDrawsCard } from './MultiDrawsCard'
import { LoadingCard } from './MultiDrawsCard/LoadingCard'
import { PastDrawsList } from './PastDrawsList'
import { NoDrawsCard } from './MultiDrawsCard/NoDrawsCard'
import { useSelectedPrizeDistributor } from '@hooks/v4/PrizeDistributor/useSelectedPrizeDistributor'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'

export const PRIZE_UI_STATES = {
  initialState: 'initialState',
  checkingForPrizes: 'checkingForPrizes',
  won: 'won',
  didNotWin: 'didNotWin'
}

export const PrizesUI = () => {
  const prizeDistributor = useSelectedPrizeDistributor()
  const prizePool = useSelectedPrizePool()
  const usersAddress = useUsersAddress()
  const { isFetched: isPrizePoolTokensFetched } = usePrizePoolTokens(prizePool)

  if (!Boolean(prizeDistributor) || !prizePool || !isPrizePoolTokensFetched) {
    return (
      <PagePadding className='flex flex-col'>
        <CheckForPrizesOnNetwork
          prizePool={prizePool}
          prizeDistributor={prizeDistributor}
          className='mb-3'
        />
        <LoadingCard />
      </PagePadding>
    )
  }

  if (!usersAddress) {
    return (
      <PagePadding className='flex flex-col'>
        <PoolPartySeason1CTA />
        <CheckForPrizesOnNetwork
          prizePool={prizePool}
          prizeDistributor={prizeDistributor}
          className='mb-3'
        />
        {/* TODO: Have an upcoming prize card since there is no longer a locked draw card to show here */}
        <NoDrawsCard />
        <PastDrawsList prizeDistributor={prizeDistributor} className='mt-8' />
      </PagePadding>
    )
  }

  return (
    <>
      <PagePadding className='flex flex-col space-y-4'>
        <PoolPartySeason1CTA />
        <CheckForPrizesOnNetwork
          prizePool={prizePool}
          prizeDistributor={prizeDistributor}
          className='mb-3'
        />
        <MultiDrawsCard prizePool={prizePool} prizeDistributor={prizeDistributor} />
        <PastDrawsList prizeDistributor={prizeDistributor} className='mt-8' />
      </PagePadding>
    </>
  )
}
const CheckForPrizesOnNetwork = (props: {
  className?: string
  prizePool: PrizePool
  prizeDistributor: PrizeDistributorV2
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
      <SelectPrizePoolModal className='network-dropdown ml-1 xs:ml-2' />
    </div>
  )
}
