import { PrizeDistributor } from '@pooltogether/v4-js-client'
import { Card } from '@pooltogether/react-components'
import React from 'react'

import { useDrawLocks } from 'lib/hooks/Tsunami/PrizeDistributor/useDrawLocks'
import { LoadingCard } from './LoadingCard'

export const LockedDrawsCard = (props: { prizeDistributor: PrizeDistributor }) => {
  const {} = props
  const { data: drawLocks, isFetched } = useDrawLocks()

  if (!isFetched) {
    return <LoadingCard />
  }

  return (
    <Card className='draw-card relative' style={{ minHeight: 200 }}>
      Locked
    </Card>
  )
}
