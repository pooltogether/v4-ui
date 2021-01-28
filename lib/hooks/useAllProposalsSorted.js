import { PROPOSAL_STATUS, SECONDS_PER_BLOCK } from 'lib/constants'
import { useAllProposals } from 'lib/hooks/useAllProposals'
import { useCurrentBlock } from 'lib/hooks/useCurrentBlock'
import { useMemo } from 'react'

export function useAllProposalsSorted () {
  const { loading, refetch, data: proposals, isFetching, isFetched, error } = useAllProposals()

  const sortedProposals = useMemo(() => {
    const executable = []
    const approved = []
    const active = []
    const pending = []
    const past = []

    if (!proposals) return { active, pending, past, approved, executable }

    Object.keys(proposals).forEach((id) => {
      const proposal = proposals[id]

      if (proposal.status === PROPOSAL_STATUS.queued) {
        executable.push(proposal)
      } else if (proposal.status === PROPOSAL_STATUS.succeeded) {
        approved.push(proposal)
      } else if (proposal.status === PROPOSAL_STATUS.pending) {
        pending.push(proposal)
      } else if (proposal.status === PROPOSAL_STATUS.active) {
        active.push(proposal)
      } else {
        past.push(proposal)
      }
    })

    return {
      executable: executable.sort(compareProposals),
      approved: approved.sort(compareProposals),
      active: active.sort(compareProposals),
      pending: pending.sort(compareProposals),
      past: past.sort(compareProposals)
    }
  }, [proposals])

  return {
    loading,
    refetch,
    sortedProposals,
    data: proposals,
    isFetching,
    isFetched,
    error
  }
}

function compareProposals (a, b) {
  return Number(b.endBlock) - Number(a.endBlock)
}
