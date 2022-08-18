import { CHAIN_ID, POOL_TOKEN, PPOOL_TICKET_TOKEN } from '@constants/misc'
import { useUsersGovernanceBalances } from '@hooks/useUsersGovernanceBalances'
import { useUsersVotes } from '@hooks/useUsersVotes'
import { useAllProposalsByStatus } from '@pooltogether/hooks'
import { ExternalLink, ThemedClipSpinner } from '@pooltogether/react-components'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { TotalWinningsSheet } from '../AccountCard/TotalWinnings'
import { SidebarCard } from '.'

export const GovernanceSidebarCard: React.FC<{ className?: string; usersAddress: string }> = (
  props
) => {
  const { className, usersAddress } = props
  const { data, isFetched, isError } = useAllProposalsByStatus()

  const { t } = useTranslation()

  return (
    <>
      <SidebarCard
        className={className}
        title={'🗳 Join governance'}
        description={<GovernanceDescription />}
        main={<UsersVotes usersAddress={usersAddress} />}
        href={'https://vote.pooltogether.com/proposals?view=active'}
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

const GovernanceDescription = () => {
  const usersAddress = useUsersAddress()
  const { data: balanceData, isFetched: isBalancesFetched } =
    useUsersGovernanceBalances(usersAddress)
  const poolBalance = balanceData?.[POOL_TOKEN[CHAIN_ID.mainnet]]
  const ppoolBalance = balanceData?.[PPOOL_TICKET_TOKEN[CHAIN_ID.mainnet]]
  const totalVotesAmount = isBalancesFetched
    ? getAmountFromBigNumber(
        poolBalance.amountUnformatted.add(ppoolBalance.amountUnformatted),
        '18'
      )
    : null

  if (isBalancesFetched && totalVotesAmount.amountUnformatted.isZero()) {
    return (
      <Trans
        i18nKey={'getPoolToControlProtocol'}
        components={{ a: <ExternalLink iconClassName='w-3 h-3 ml-1 mb-1' /> }}
      />
    )
  }

  return <>PoolTogether is in your hands</>
}

const UsersVotes: React.FC<{ usersAddress: string }> = (props) => {
  const { usersAddress } = props
  const { data: balanceData, isFetched: isBalancesFetched } =
    useUsersGovernanceBalances(usersAddress)
  const { data: votes, isFetched } = useUsersVotes(usersAddress)
  const ppoolBalance = balanceData?.[PPOOL_TICKET_TOKEN[CHAIN_ID.mainnet]]
  const totalVotesAmount =
    isFetched && isBalancesFetched
      ? getAmountFromBigNumber(votes.amountUnformatted.add(ppoolBalance.amountUnformatted), '18')
      : null

  return (
    <div>
      {totalVotesAmount ? (
        totalVotesAmount.amountUnformatted.isZero() ? (
          <span>No votes</span>
        ) : (
          <span>{`${totalVotesAmount.amountPretty} Votes`}</span>
        )
      ) : !!usersAddress ? (
        <ThemedClipSpinner sizeClassName='w-4 h-4' />
      ) : null}

      {!!usersAddress && (
        <ul className='font-normal text-xs'>
          <li className='flex justify-between'>
            <span>On chain</span>
            {isFetched ? (
              <span className='font-bold'>{votes.amountPretty}</span>
            ) : (
              <ThemedClipSpinner sizeClassName='w-4 h-4' />
            )}
          </li>
          <li className='flex justify-between'>
            <span>Off chain</span>
            {isBalancesFetched ? (
              <span className='font-bold'>{ppoolBalance.amountPretty}</span>
            ) : (
              <ThemedClipSpinner sizeClassName='w-4 h-4' />
            )}
          </li>
        </ul>
      )}
    </div>
  )
}
