import { Token } from '@pooltogether/hooks'
import { Card } from '@pooltogether/react-components'
import {
  Draw,
  DrawPrize,
  PrizeDistribution,
  PrizePool,
  calculatePrizeForDistributionIndex
} from '@pooltogether/v4-js-client'
import classNames from 'classnames'
import { ConnectWalletButton } from 'lib/components/ConnectWalletButton'
import { ConnectWalletCard } from 'lib/components/ConnectWalletCard'
import { PrizeWLaurels } from 'lib/components/Images/PrizeWithLaurels'
import { PagePadding } from 'lib/components/Layout/PagePadding'
import { SelectedNetworkToggle } from 'lib/components/SelectedNetworkToggle'
import { usePrizeDistribution } from 'lib/hooks/Tsunami/DrawPrizes/usePrizeDistribution'
import { useValidDrawsAndPrizeDistributions } from 'lib/hooks/Tsunami/DrawPrizes/useValidDrawsAndPrizeDistributions'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { useNextDrawDate } from 'lib/hooks/Tsunami/useNextDrawDate'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { getPrettyDate } from 'lib/utils/getNextDrawDate'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { DrawDetails, DrawDetailsProps } from './DrawCard'

interface NoAccountPrizeUIProps {
  drawPrize: DrawPrize
  prizePool: PrizePool
}

export const NoAccountPrizeUI = (props: NoAccountPrizeUIProps) => {
  const { drawPrize, prizePool } = props

  const nextDrawDate = useNextDrawDate()

  return (
    <PagePadding className='flex flex-col space-y-4'>
      <PrizeWLaurels className='mx-auto mb-8' />
      <ConnectWalletCard className='mb-8' />
      <PastPrizeList {...props} />
    </PagePadding>
  )
}

const PastPrizeList = (props: NoAccountPrizeUIProps) => {
  const { prizePool, drawPrize } = props
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)
  const { data: drawsAndPrizeDistributions, isFetched: isDrawsAndPrizeDistributionsFetched } =
    useValidDrawsAndPrizeDistributions(drawPrize)

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
      <ul className='space-y-4'>
        {drawsAndPrizeDistributions.map((drawAndPrizeDistribution) => (
          <PastPrizeListItem
            key={`past-prize-list-${drawAndPrizeDistribution.draw.drawId}-${drawPrize.id()}`}
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
      <DrawDetails {...props} />
    </Card>
  </li>
)

const PastPrizesHeader = (props: { className?: string }) => {
  const { t } = useTranslation()
  return (
    <div
      className={classNames(
        props.className,
        'flex justify-between sticky top-20 sm:top-24 bg-body py-2 z-10'
      )}
    >
      <span className='font-semibold text-accent-1 text-lg'>{t('pastPrizes', 'Past prizes')}</span>
      <SelectedNetworkToggle />
    </div>
  )
}

const LoadingRow = () => <div className='w-full rounded-lg animate-pulse bg-card h-36' />
