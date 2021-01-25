import { BasicTable } from 'lib/components/BasicTable'
import classnames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { Button } from 'lib/components/Button'
import { Card } from 'lib/components/Card'
import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import { VOTERS_PER_PAGE } from 'lib/constants'
import { useProposalData } from 'lib/hooks/useProposalData'
import { useProposalVotes } from 'lib/hooks/useProposalVotes'
import { formatVotes } from 'lib/utils/formatVotes'
import React, { useState } from 'react'
import { useTable } from 'react-table'
import { EtherscanAddressLink } from 'lib/components/EtherscanAddressLink'
import { shorten } from 'lib/utils/shorten'

export const VotersTable = (props) => {
  // TODO: Page buttons. Need total number of voters.
  const { id } = props
  const [pageNumber, setPageNumber] = useState(0)
  const { data, isFetching, isFetched } = useProposalVotes(id, pageNumber)

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

const VoterCell = (props) => {
  return (
    <EtherscanAddressLink className='text-accent-1' address={props.value}>
      {shorten(props.value)}
    </EtherscanAddressLink>
  )
}
