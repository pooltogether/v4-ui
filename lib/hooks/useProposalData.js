import { useAllProposals } from 'lib/hooks/useAllProposals'

export function useProposalData (id) {
  const { refetch, data, isFetching, isFetched, error } = useAllProposals()

  return {
    loading: !isFetched || (isFetching && !isFetched),
    proposal: data?.[id],
    refetch,
    isFetching,
    isFetched,
    error
  }
}
