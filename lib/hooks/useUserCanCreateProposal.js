import { ethers } from 'ethers'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { useGovernorAlpha } from 'lib/hooks/useGovernorAlpha'
import { useTokenHolder } from 'lib/hooks/useTokenHolder'
import { useContext } from 'react'

export const useUserCanCreateProposal = () => {
  const { usersAddress } = useContext(AuthControllerContext)
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
      tokenHolder.selfDelegated &&
      governorAlpha.proposalThreshold.lte(
        ethers.utils.bigNumberify(tokenHolder.delegate.delegatedVotesRaw)
      )
  }
}
