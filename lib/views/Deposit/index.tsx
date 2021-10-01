import React from 'react'

import { ContentPanesProps } from 'lib/views/DefaultPage'
import { BackToV3Banner } from 'lib/components/BackToV3Banner'
import { DepositCard } from 'lib/views/Deposit/DepositCard'
import { PrizeBreakdownCard } from 'lib/views/Deposit/PrizeBreakdownCard'
import { UpcomingPrizeCard } from 'lib/views/Deposit/UpcomingPrizeCard'

export const DepositUI = (props: ContentPanesProps) => {
  return (
    <div className='flex flex-col space-y-4'>
      <UpcomingPrizeCard />
      <DepositCard {...props} />
      <BackToV3Banner />
      <PrizeBreakdownCard />
    </div>
  )
}

// const DepositPaneZ = (props: ContentPanesProps) => {
//   const { t } = useTranslation()

//   const { data: prizePool, isFetched: isPrizePoolFetched } = useSelectedNetworkPrizePool()
//   const { data: player, isFetched: isPlayerFetched } = useSelectedNetworkPlayer()
//   const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
//     usePrizePoolTokens(prizePool)
//   const {
//     data: usersBalances,
//     refetch: refetchUsersBalances,
//     isFetched: isUsersBalancesFetched
//   } = useUsersPrizePoolBalances(prizePool)
//   const {
//     data: usersDepositAllowance,
//     refetch: refetchUsersDepositAllowance,
//     isFetched: isUsersDepositAllowanceFetched
//   } = useUsersDepositAllowance(prizePool)

//   const form = useForm({
//     mode: 'onChange',
//     reValidateMode: 'onChange'
//   })

//   const refetchOnApprove = () => refetchUsersDepositAllowance()
//   const refetchOnDeposit = () => refetchUsersBalances()

//   const quantity = form.watch('quantity') || ''
//   const quantityDetails: Amount = {
//     quantity,
//     quantityUnformatted: safeParseUnits(quantity || '0', prizePoolTokens?.token.decimals),
//     quantityPretty: numberWithCommas(quantity) as string
//   }

//   return (
//     <>
//       <div className='relative bg-card rounded-lg w-full flex flex-col items-center mb-4 px-4 sm:px-8 py-10 xs:p-10'>
//         <Deposit
//           {...props}
//           player={player}
//           prizePool={prizePool}
//           form={form}
//           isPrizePoolFetched={isPrizePoolFetched}
//           isPrizePoolTokensFetched={isPrizePoolTokensFetched}
//           isPlayerFetched={isPlayerFetched}
//           isUsersBalancesFetched={isUsersBalancesFetched}
//           isUsersDepositAllowanceFetched={isUsersDepositAllowanceFetched}
//           tokenBalance={usersBalances?.token}
//           ticketBalance={usersBalances?.ticket}
//           token={prizePoolTokens?.token}
//           ticket={prizePoolTokens?.ticket}
//           depositAllowance={usersDepositAllowance}
//           quantityDetails={quantityDetails}
//           refetchOnApprove={refetchOnApprove}
//           refetchOnDeposit={refetchOnDeposit}
//         />
//       </div>
//     </>
//   )
// }
