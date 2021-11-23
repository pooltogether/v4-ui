import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import React, { useEffect, useState } from 'react'

export const PrizesCard = () => {


  const usersAddress = useUsersAddress()
  const [userHasUncheckedPrizesOnMount, setUserHasUncheckedPrizesOnMount] = useState<Boolean>(null)

  // Reset when address changes
  useEffect(() => {
    setUserHasUncheckedPrizesOnMount(null)
  }, [usersAddress])

  // When data loads, set state
  useEffect(() => {
    if (isFetched && userHasUncheckedPrizesOnMount === null) {
      if (userHasUncheckedPrizes) {
        setUserHasUncheckedPrizesOnMount(true)
      } else {
        setUserHasUncheckedPrizesOnMount(false)
      }
    }
  }, [userHasUncheckedPrizes, userHasUncheckedPrizesOnMount, isFetched])

  if (!isFetched ) {
    return <LoadingCard />
  } else if (userHasUncheckedPrizes && userHasUncheckedPrizesOnMount) {
    return <PrizeCheckerCard />
  } else if (userHasUnclaimedPrizes) {
    return <PrizeClaimCard />
  } else if (latestDrawIsLocked) {
    return <LockedDrawCard />
  }

  return <div />
}

const PrizeCheckerCard = () => {
  return <div />
}

const PrizeClaimCard = () => {
  return <div />
}

const LockedDrawCard = () => {
  return <div />
}

const PrizesCardContainer = () => {
  return <Card className='draw-card' paddingClassName=''>>
    <div className=''>

    </div>
  </Card>
}

const LoadingCard = () => <div className='draw-card rounded-xl animate-pulse bg-card' />

const usePrizeClaimCardState = () => {
  return { data: {}, isFetched:}
}
