import { MAINNET_POOL_ADDRESS, MAINNET_PPOOL_ADDRESS } from '@constants/misc'
import { useUsersGovernanceBalances } from '@hooks/useUsersGovernanceBalances'
import { useUsersTotalClaimedAmount } from '@hooks/v4/PrizeDistributor/useUsersTotalClaimedAmount'
import { useAllProposalsByStatus } from '@pooltogether/hooks'
import { ThemedClipSpinner } from '@pooltogether/react-components'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TotalWinningsSheet } from './AccountCard/TotalWinnings'
import { SidebarCard } from './SidebarCard'

export const GovernanceSidebarCard = () => {
  const { data, isFetched, isError } = useAllProposalsByStatus()

  const { t } = useTranslation()
  const disabled = !isFetched || isError || data.active.length === 0

  return (
    <>
      <SidebarCard
        title={'🗳 Join governance'}
        description={'PoolTogether is in your hands'}
        main={<UsersVotes />}
        href={'https://vote.pooltogether.com/'}
        link={
          isFetched && data.active.length > 0
            ? t('activeProposalsCount', { count: data.active.length })
            : t('seeMore', 'See more')
        }
        showLink
      />
    </>
  )
}

const UsersVotes = () => {
  const usersAddress = useUsersAddress()
  const { data: balanceData, isFetched } = useUsersGovernanceBalances(usersAddress)

  const poolBalance = balanceData?.[MAINNET_POOL_ADDRESS]
  const ppoolBalance = balanceData?.[MAINNET_PPOOL_ADDRESS]

  const totalVotesAmount = isFetched
    ? getAmountFromBigNumber(
        poolBalance.amountUnformatted.add(ppoolBalance.amountUnformatted),
        '18'
      )
    : null

  return (
    <div>
      {totalVotesAmount ? (
        totalVotesAmount.amountUnformatted.isZero() ? (
          <span>No votes</span>
        ) : (
          <span>{`${totalVotesAmount.amountPretty} Votes`}</span>
        )
      ) : (
        <ThemedClipSpinner sizeClassName='w-4 h-4' />
      )}

      <ul className='font-normal text-xs'>
        <li className='flex justify-between'>
          <span>On chain</span>
          {isFetched ? (
            <span>{poolBalance.amountPretty}</span>
          ) : (
            <ThemedClipSpinner sizeClassName='w-4 h-4' />
          )}
        </li>
        <li className='flex justify-between'>
          <span>Off chain</span>
          {isFetched ? (
            <span>{ppoolBalance.amountPretty}</span>
          ) : (
            <ThemedClipSpinner sizeClassName='w-4 h-4' />
          )}
        </li>
      </ul>
    </div>
  )
}
