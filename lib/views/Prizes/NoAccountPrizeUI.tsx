import { Card } from '@pooltogether/react-components'
import { PrizeDistributor, PrizePool } from '@pooltogether/v4-js-client'
import classNames from 'classnames'
import { useAtom } from 'jotai'
import { ConnectWalletCard } from 'lib/components/ConnectWalletCard'
import { PrizeWLaurels } from 'lib/components/Images/PrizeWithLaurels'
import { PagePadding } from 'lib/components/Layout/PagePadding'
import { SelectedNetworkToggle } from 'lib/components/SelectedNetworkToggle'
import { useClaimableDrawsAndPrizeDistributions } from 'lib/hooks/Tsunami/PrizeDistributor/useClaimableDrawsAndPrizeDistributions'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { useNextDrawDate } from 'lib/hooks/Tsunami/useNextDrawDate'
import React, { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DrawDate,
  DrawDetailsProps,
  DrawId,
  PrizeDistributorTotal,
  ViewPrizesTrigger
} from './DrawCard/DrawDetails'

interface NoAccountPrizeUIProps {
  prizeDistributor: PrizeDistributor
  prizePool: PrizePool
}

export const NoAccountPrizeUI = (props: NoAccountPrizeUIProps) => {
  const { prizeDistributor, prizePool } = props

  const nextDrawDate = useNextDrawDate()

  return (
    <PagePadding className='flex flex-col space-y-4'>
      <PrizeWLaurels className='mx-auto mb-4' />
      <ConnectWalletCard />
      <PastPrizeList {...props} />
    </PagePadding>
  )
}

const PastPrizeList = (props: NoAccountPrizeUIProps) => {
  const { prizePool, prizeDistributor } = props
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)
  const { data: drawsAndPrizeDistributions, isFetched: isDrawsAndPrizeDistributionsFetched } =
    useClaimableDrawsAndPrizeDistributions(prizeDistributor)

  if (!isPrizePoolTokensFetched || !isDrawsAndPrizeDistributionsFetched) {
    return (
      <>
        <PastPrizesHeader />
        <ul className='space-y-4'>
          <LoadingRow />
          <LoadingRow />
          <LoadingRow />
        </ul>
      </>
    )
  }

  return (
    <>
      <PastPrizesHeader />
      {drawsAndPrizeDistributions.length === 0 && (
        <div className='opacity-70 text-center w-full mt-12'>No draws yet, check back soon</div>
      )}
      <ul className='space-y-4'>
        {drawsAndPrizeDistributions.map((drawAndPrizeDistribution) => (
          <PastPrizeListItem
            key={`past-prize-list-${drawAndPrizeDistribution.draw.drawId}-${prizeDistributor.id()}`}
            {...drawAndPrizeDistribution}
            token={prizePoolTokens.token}
          />
        ))}
      </ul>
    </>
  )
}

const PastPrizeListItem = (props: DrawDetailsProps) => (
  <li>
    <Card>
      <div className='flex flex-row space-x-2 mb-1'>
        <DrawId {...props} />
        <DrawDate {...props} />
      </div>
      <div className='flex justify-between'>
        <PrizeDistributorTotal {...props} numberClassName='font-bold text-xl' />
        <ViewPrizesTrigger {...props} />
      </div>
    </Card>
  </li>
)

const PastPrizesHeader = (props: { className?: string }) => {
  const { t } = useTranslation()
  return (
    <div
      className={classNames(
        props.className,
        'flex justify-between sticky top-12 sm:top-20 bg-body pt-4 pb-2 z-10'
      )}
    >
      <span className='font-semibold text-accent-1 text-lg'>{t('pastDraws', 'Past draws')}</span>
      <SelectedNetworkToggle />
    </div>
  )
}

const LoadingRow = () => <div className='w-full rounded-lg animate-pulse bg-card h-36' />
