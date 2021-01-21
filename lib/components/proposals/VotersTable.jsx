import { BasicTable } from 'lib/components/BasicTable'
import { Button } from 'lib/components/Button'
import { Card } from 'lib/components/Card'
import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import { VOTERS_PER_PAGE } from 'lib/constants'
import { useProposalData } from 'lib/hooks/useProposalData'
import { useProposalVotes } from 'lib/hooks/useProposalVotes'
import { formatVotes } from 'lib/utils/formatVotes'
import React, { useState } from 'react'
import { useTable } from 'react-table'

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
    const newPage = pageNumber + 1
    setPageNumber(newPage)
  }

  const columns = React.useMemo(() => {
    return [
      {
        Header: 'Voter',
        accessor: 'voter',
      },
      {
        Header: 'Voting Weight',
        accessor: 'votes',
      },
      {
        Header: 'Decision',
        accessor: 'support',
        Cell: SupportCell,
      },
    ]
  }, [])

  const rowData = React.useMemo(() => {
    if (!data) {
      return []
    }

    return data.votes.map((vote) => ({
      voter: vote.voter.id,
      votes: formatVotes(vote.votesRaw),
      support: vote.support,
    }))
  }, [data, isFetching, isFetched])

  const tableInstance = useTable({
    columns,
    data: rowData,
  })

  if (isFetching && !isFetched) {
    return (
      <Card>
        <V3LoadingDots />
      </Card>
    )
  }

  return (
    <Card>
      <BasicTable tableInstance={tableInstance} />
      <div className='flex flex-row'>
        <Button onClick={prevPage}>Prev</Button>
        <Button onClick={nextPage}>Next</Button>
        Page: {pageNumber}
      </div>
    </Card>
  )
}

const SupportCell = (props) => {
  if (props.value) {
    return 'Accepted'
  }
  return 'Rejected'
}
