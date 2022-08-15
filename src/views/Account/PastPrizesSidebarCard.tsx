import { useUsersTotalClaimedAmountGraph } from '@hooks/v4/PrizeDistributor/useUsersTotalClaimedAmountGraph'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useState } from 'react'
import { TotalWinningsAmount, TotalWinningsSheet } from './AccountCard/TotalWinnings'
import { SidebarCard } from './SidebarCard'

export const PastPrizesSidebarCard = () => {
  const [isOpen, setIsOpen] = useState(false)

  const usersAddress = useUsersAddress()
  const { isFetched } = useUsersTotalClaimedAmountGraph(usersAddress)

  return (
    <>
      <SidebarCard
        title={'🏆 Claimed prizes'}
        description={'Totalled over the past 8 months'}
        main={<TotalWinningsAmount />}
        trigger={'See more'}
        showTrigger
        onClick={() => setIsOpen(true)}
        disabled={!isFetched}
      />
      <TotalWinningsSheet open={isOpen} onDismiss={() => setIsOpen(false)} />
    </>
  )
}
