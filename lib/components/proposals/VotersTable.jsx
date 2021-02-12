import React from 'react'
import classnames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTable } from 'react-table'

import { useTranslation } from 'lib/../i18n'
import { BasicTable } from 'lib/components/BasicTable'
import { DelegateAddress } from 'lib/components/UsersVotesCard'
import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import { useProposalVotes, useProposalVotesPages } from 'lib/hooks/useProposalVotes'
import { formatVotes } from 'lib/utils/formatVotes'

export const VotersTable = (props) => {
  // TODO: Page buttons. Need total number of voters.
  const { id } = props

  const { t } = useTranslation()

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
  const { t } = useTranslation()

  if (props.value) {
    return t('accepted')
  }
  return t('rejected')
}

const VoterCell = (props) => <DelegateAddress address={props.value} />
