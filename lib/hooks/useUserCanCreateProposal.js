import { ethers } from 'ethers'
import { useUsersAddress } from '@pooltogether/hooks'

import { DEFAULT_TOKEN_PRECISION } from 'lib/constants'
import { useGovernorAlpha } from 'lib/hooks/useGovernorAlpha'
import { useTokenHolder } from 'lib/hooks/useTokenHolder'

export const useUserCanCreateProposal = () => {
  const usersAddress = useUsersAddress()
  const { data: governorAlpha, isFetched: governorAlphaIsFetched } = useGovernorAlpha()
  const { data: tokenHolder, isFetched: tokenHolderIsFetched } = useTokenHolder(usersAddress)

  if (!tokenHolderIsFetched || !governorAlphaIsFetched) {
    return {
      isFetched: false,
      userCanCreateProposal: false
    }
  }

  if (!tokenHolder) {
    return {
      isFetched: true,
      userCanCreateProposal: false
    }
  }

  return {
    isFetched: true,
    userCanCreateProposal:
      tokenHolder.canVote &&
      Number(tokenHolder.delegatedVotes) >=
        Number(ethers.utils.formatUnits(governorAlpha.proposalThreshold, DEFAULT_TOKEN_PRECISION))
  }
}
