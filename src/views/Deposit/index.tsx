import { NEGATIVE_HEADER_MARGIN } from '@components/Layout/PageHeader'
import { PagePadding } from '@components/Layout/PagePadding'
import classNames from 'classnames'
import React from 'react'
import { DepositTrigger } from './DepositTrigger'
import { RewardsBanners } from './DepositTrigger/RewardsBanners'
import { PrizePoolNetworkCarousel } from './PrizePoolNetworkCarousel'

export const DepositUI = () => {
  return (
    <PagePadding
      pxClassName=''
      widthClassName=''
      className={classNames('flex flex-col space-y-2 xs:space-y-4 sm:space-y-8 lg:space-y-12')}
      style={{ minHeight: '620px' }}
    >
      <RewardsBanners />
      <PrizePoolNetworkCarousel />
      <DepositTrigger />
    </PagePadding>
  )
}
