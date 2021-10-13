import React from 'react'
import { PrizeDistributor, PrizePool } from '@pooltogether/v4-js-client'

import { ConnectWalletCard } from 'lib/components/ConnectWalletCard'
import { PrizeWLaurels } from 'lib/components/Images/PrizeWithLaurels'
import { PagePadding } from 'lib/components/Layout/PagePadding'
import { PastDrawsList } from './PastDrawsList'

interface NoAccountPrizeUIProps {
  prizeDistributor: PrizeDistributor
  prizePool: PrizePool
}

export const NoAccountPrizeUI = (props: NoAccountPrizeUIProps) => {
  const { prizeDistributor, prizePool } = props

  return (
    <PagePadding className='flex flex-col space-y-4'>
      <PrizeWLaurels className='mx-auto mb-4' />
      <ConnectWalletCard />
      <PastDrawsList {...props} />
    </PagePadding>
  )
}
