import React from 'react'
import { useRouter } from 'next/router'
import { useTable } from 'react-table'

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

  // const [pageNumber, setPageNumber] = useProposalVotesPages(id)
  const { data, isFetching, isFetched } = useProposalVotes(id)

  // const prevPage = (e) => {
  //   e.preventDefault()
  //   const newPage = pageNumber - 1
  //   setPageNumber(newPage >= 0 ? newPage : 0)
  // }

  // const nextPage = (e) => {
  //   e.preventDefault()
  //   // TODO: Get last page number
  //   const newPage = pageNumber + 1
  //   setPageNumber(newPage)
  // }

  // const voteCount = proposals

  const voteCount = 66
  const VOTE_PAGE_SIZE = 10

  const page = router?.query?.page ? parseInt(router.query.page, 10) : 1
  const pages = Math.ceil(Number(voteCount / VOTE_PAGE_SIZE))

  const baseAsPath = `/proposals/${id}`
  const baseHref = '/proposals/[id]'

  const asPath = (pageNum) => `${baseAsPath}?page=${pageNum}`
  const nextPage = page + 1
  const prevPage = page - 1
  const nextPath = asPath(nextPage)
  const prevPath = asPath(prevPage)

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

  if (isFetching && !isFetched) {
    return <V3LoadingDots />
  }

  return (
    <>
      {data?.votes?.length === 0 ? 
        <BlankStateMessage>
          {t('noVotesHaveBeenCastYet')}
        </BlankStateMessage> : (
        <>
          <BasicTable tableInstance={tableInstance} />
{/* 
          <div className='flex flex-row justify-center mt-4'>
            <button type='button' onClick={prevPage}>
              <FeatherIcon
                icon='chevron-left'
                className={classnames(
                  'w-8 h-8 text-accent-1 hover:text-inverse trans stroke-current stroke-1',
                  {
                    'opacity-20': pageNumber === 0
                  }
                )}
              />
            </button>
            <span className='my-auto text-accent-1 mx-2'>{pageNumber}</span>
            <button type='button' onClick={nextPage}>
              <FeatherIcon
                icon='chevron-right'
                className={classnames(
                  'w-8 h-8 text-accent-1 hover:text-inverse trans stroke-current stroke-1'
                )}
              />
            </button>
          </div> */}

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
