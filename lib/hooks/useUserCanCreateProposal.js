import { ethers } from 'ethers'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { useGovernorAlphaData } from 'lib/hooks/useGovernanceData'
import { useTokenHolder } from 'lib/hooks/useTokenHolder'
import { useContext } from 'react'

export const useUserCanCreateProposal = () => {
  const { usersAddress } = useContext(AuthControllerContext)
  const { data: governorAlphaData, isFetched: isGovernorAlphaDataFetched } = useGovernorAlphaData()
  const { data: tokenHolder, isFetched: isTokenHolderFetched } = useTokenHolder(usersAddress)

  if (!isTokenHolderFetched || !isGovernorAlphaDataFetched) {
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
      governorAlphaData.proposalThreshold.lte(
        ethers.utils.bigNumberify(tokenHolder.delegate.delegatedVotesRaw)
      )
  }
}
