import { useUsersTotalClaimedAmountGraph } from '@hooks/v4/PrizeDistributor/useUsersTotalClaimedAmountGraph'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { SidebarCard } from '.'
import { TotalWinningsAmount, TotalWinningsSheet } from '../AccountCard/TotalWinnings'

export const PastPrizesSidebarCard: React.FC<{ usersAddress: string }> = (props) => {
  const { usersAddress } = props
  const [isOpen, setIsOpen] = useState(false)
  const { isFetched, data } = useUsersTotalClaimedAmountGraph(usersAddress)
  const { t } = useTranslation()

  if (!usersAddress) return null

  return (
    <>
      <SidebarCard
        title={'🏆 Claimed prizes'}
        isLoading={!isFetched}
        description={
          isFetched && !data?.totalClaimedAmount.amountUnformatted.isZero()
            ? `You've claimed ${data.totalClaimedPrizes} prizes`
            : t('noPrizesYet')
        }
        main={<TotalWinningsAmount usersAddress={usersAddress} />}
        trigger={'See more'}
        showTrigger
        onClick={() => setIsOpen(true)}
        disabled={!isFetched}
      />
      <TotalWinningsSheet
        open={isOpen}
        onDismiss={() => setIsOpen(false)}
        usersAddress={usersAddress}
      />
    </>
  )
}
