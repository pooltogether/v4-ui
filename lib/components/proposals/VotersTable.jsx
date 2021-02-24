import React from 'react'
import { useRouter } from 'next/router'
import { useTable } from 'react-table'

import { VOTERS_PER_PAGE } from 'lib/constants'
import { useTranslation } from 'lib/../i18n'
import { BasicTable } from 'lib/components/BasicTable'
import { BlankStateMessage } from 'lib/components/BlankStateMessage'
import { DelegateAddress } from 'lib/components/UsersVotesCard'
import { PaginationUI } from 'lib/components/PaginationUI'
import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import { useProposalVotes, useProposalVotesPages } from 'lib/hooks/useProposalVotes'
import { formatVotes } from 'lib/utils/formatVotes'

export const VotersTable = (props) => {
  const { id } = props

  const { t } = useTranslation()
  const router = useRouter()

  const allVotesPageNumber = -1
  const { data: allVotes, isFetched: allVotesFetched } = useProposalVotes(id, allVotesPageNumber)

  const voteCount = allVotes?.votes?.length

  const page = router?.query?.page ? parseInt(router.query.page, 10) : 1
  const pages = Math.ceil(Number(voteCount / VOTERS_PER_PAGE))

  const baseAsPath = `/proposals/${id}`
  const baseHref = '/proposals/[id]'

  const asPath = (pageNum) => `${baseAsPath}?page=${pageNum}`
  const nextPage = page + 1
  const prevPage = page - 1
  const nextPath = asPath(nextPage)
  const prevPath = asPath(prevPage)

  const { data, isFetching, isFetched } = useProposalVotes(id, page)

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
  }, [data, isFetching, isFetched])

  const tableInstance = useTable({
    columns,
    data: rowData
  })

  return (
    <>
      {allVotes && allVotes.votes && allVotes.votes.length === 0 ? (
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

          <PaginationUI
            prevPath={prevPath}
            nextPath={nextPath}
            prevPage={prevPage}
            nextPage={nextPage}
            currentPage={page}
            currentPath={asPath(page)}
            firstPath={asPath(1)}
            lastPath={asPath(pages)}
            hrefPathname={baseHref}
            lastPage={pages}
            showFirst={page > 2}
            showLast={pages > 2 && page < pages - 1}
            showPrev={page > 1}
            showNext={pages > page}
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
