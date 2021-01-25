import { SECONDS_PER_BLOCK } from 'lib/constants'
import { useAllProposals } from 'lib/hooks/useAllProposals'
import { useCurrentBlock } from 'lib/hooks/useCurrentBlock'
import { useMemo } from 'react'

export function useAllProposalsSorted () {
  const { loading, refetch, data: proposals, isFetching, isFetched, error } = useAllProposals()
  const currentBlock = useCurrentBlock()
  console.log(currentBlock)

  const sortedProposals = useMemo(() => {
    const active = []
    const pending = []
    const past = []

    if (!proposals || !currentBlock) return { active, pending, past }

    Object.keys(proposals).forEach((id) => {
      const proposal = proposals[id]
      const startBlock = Number(proposal.startBlock)
      const endBlock = Number(proposal.endBlock)
      const currentBlockNumber = currentBlock.number
      const blockDifference = currentBlockNumber - endBlock
      // TODO:
      // const proposalEndTime = Date(currentBlock.timestamp - SECONDS_PER_BLOCK * blockDifference)
      // console.log(proposalEndTime, Date(currentBlock.timestamp))

      // const endDate = DateTime.fromSeconds(
      //         currentTimestamp
      //           .add(BigNumber.from(AVERAGE_BLOCK_TIME_IN_SECS).mul(BigNumber.from(proposalData.endBlock - currentBlock)))
      //           .toNumber()
      //       )
      //     : undefined
      // const now: DateTime = DateTime.local()

      if (currentBlockNumber > endBlock) {
        past.push(proposal)
      } else if (currentBlockNumber > startBlock) {
        active.push(proposal)
      } else {
        pending.push(proposal)
      }
    })

    return {
      active: active.sort(compareProposals),
      pending: pending.sort(compareProposals),
      past: past.sort(compareProposals)
    }
  }, [proposals, currentBlock])

  console.log(sortedProposals)

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
