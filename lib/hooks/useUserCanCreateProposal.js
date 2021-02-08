import { useGovernorAlphaData } from 'lib/hooks/useGovernanceData'
import { usePoolTokenData } from 'lib/hooks/usePoolTokenData'

export const useUserCanCreateProposal = () => {
  const { data: governorAlphaData, isFetched: isGovernorAlphaDataFetched } = useGovernorAlphaData()
  const { data: poolTokenData, isFetched: isPoolTokenDataFetched } = usePoolTokenData()

  if (!isPoolTokenDataFetched || !isGovernorAlphaDataFetched) {
    return {
      isFetched: false,
      userCanCreateProposal: false
    }
  }

  return {
    isFetched: isGovernorAlphaDataFetched && isPoolTokenDataFetched,
    userCanCreateProposal: governorAlphaData.proposalThreshold.lte(poolTokenData.usersBalanceBN)
  }
}
