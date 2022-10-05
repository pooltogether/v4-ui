import { useUsersTotalClaimedAmountGraph } from '@hooks/v4/PrizeDistributor/useUsersTotalClaimedAmountGraph'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useState } from 'react'
import { SidebarCard } from '.'
import { TotalWinningsAmount, TotalWinningsSheet } from '../AccountCard/TotalWinnings'

export const PastPrizesSidebarCard: React.FC<{ usersAddress: string }> = (props) => {
  const { usersAddress } = props
  const [isOpen, setIsOpen] = useState(false)
  const { isFetched } = useUsersTotalClaimedAmountGraph(usersAddress)

  if (!usersAddress) return null

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
