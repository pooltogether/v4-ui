import React from 'react'
import { useRouter } from 'next/router'
import { useTable } from 'react-table'

import { VOTERS_PER_PAGE } from 'lib/constants'
import { useTranslation } from 'react-i18next'
import { BasicTable } from 'lib/components/BasicTable'
import { BlankStateMessage } from 'lib/components/BlankStateMessage'
import { DefaultPaginationButtons, PaginationUI } from 'lib/components/PaginationUI'
import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import { useProposalVotes } from 'lib/hooks/useProposalVotes'
import { formatVotes } from 'lib/utils/formatVotes'
import { DelegateAddress } from 'lib/components/UsersPoolVotesCard'
import { useProposalVotesTotalPages } from 'lib/hooks/useProposalVotesTotalPages'

export const VotersTable = (props) => {
  const { id } = props

  const { t } = useTranslation()
  const router = useRouter()

  const { data: totalPages, isFetched: totalPagesIsFetched } = useProposalVotesTotalPages(id)
  const currentPage = router?.query?.page ? parseInt(router.query.page, 10) : 1
  const baseAsPath = `/proposals/${id}`
  const baseHref = '/proposals/[id]'

  const { data, isFetching, isFetched } = useProposalVotes(id, currentPage)

  const columns = React.useMemo(() => {
    return [
      {
        Header: t('voter'),
        accessor: 'voter',
        Cell: VoterCell
      },
      {
        Header: t('votingWeight'),
        accessor: 'votes'
      },
      {
        Header: t('decision'),
        accessor: 'support',
        Cell: SupportCell
      }
    ]
  }, [])

  const rowData = React.useMemo(() => {
    if (!data) {
      return []
    }

    return data.votes.map((vote) => ({
      voter: vote.voter.id,
      votes: formatVotes(vote.votesRaw),
      support: vote.support
    }))
  }, [data])

  const tableInstance = useTable({
    columns,
    data: rowData
  })

  if (!totalPagesIsFetched) return null

  return (
    <>
      {totalPages === 0 ? (
        <BlankStateMessage>{t('noVotesHaveBeenCastYet')}</BlankStateMessage>
      ) : (
        <>
          <div className='basic-table-min-height'>
            {isFetching && !isFetched ? (
              <V3LoadingDots />
            ) : (
              <BasicTable tableInstance={tableInstance} />
            )}
          </div>

          <DefaultPaginationButtons
            currentPage={currentPage}
            totalPages={totalPages}
            baseAsPath={baseAsPath}
            baseHref={baseHref}
          />
        </>
      )}
    </>
  )
}

const SupportCell = (props) => {
  const { t } = useTranslation()

  if (props.value) {
    return t('accepted')
  }
  return t('rejected')
}

const VoterCell = (props) => <DelegateAddress address={props.value} />
