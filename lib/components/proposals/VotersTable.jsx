import { BasicTable } from 'lib/components/BasicTable'
import classnames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import { useProposalVotes, useProposalVotesPages } from 'lib/hooks/useProposalVotes'
import { formatVotes } from 'lib/utils/formatVotes'
import React from 'react'
import { useTable } from 'react-table'
import { DelegateAddress } from 'lib/components/UsersVotesCard'

export const VotersTable = (props) => {
  // TODO: Page buttons. Need total number of voters.
  const { id } = props

  const [pageNumber, setPageNumber] = useProposalVotesPages(id)
  const { data, isFetching, isFetched } = useProposalVotes(id)

  const prevPage = (e) => {
    e.preventDefault()
    const newPage = pageNumber - 1
    setPageNumber(newPage >= 0 ? newPage : 0)
  }

  const nextPage = (e) => {
    e.preventDefault()
    // TODO: Get last page number
    const newPage = pageNumber + 1
    setPageNumber(newPage)
  }

  const columns = React.useMemo(() => {
    return [
      {
        Header: 'Voter',
        accessor: 'voter',
        Cell: VoterCell
      },
      {
        Header: 'Voting Weight',
        accessor: 'votes'
      },
      {
        Header: 'Decision',
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
      <BasicTable tableInstance={tableInstance} />
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
      </div>
    </>
  )
}

const SupportCell = (props) => {
  if (props.value) {
    return 'Accepted'
  }
  return 'Rejected'
}

const VoterCell = (props) => <DelegateAddress address={props.value} />
