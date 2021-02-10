import { ethers } from 'ethers'
import { Banner } from 'lib/components/Banner'
import { PageTitleAndBreadcrumbs } from 'lib/components/PageTitleAndBreadcrumbs'
import { ProposalCreationForm } from 'lib/components/proposals/ProposalCreationForm'
import { DEFAULT_TOKEN_PRECISION } from 'lib/constants'
import { useGovernorAlpha } from 'lib/hooks/useGovernorAlpha'
import { usePoolTokenData } from 'lib/hooks/usePoolTokenData'
import { useUserCanCreateProposal } from 'lib/hooks/useUserCanCreateProposal'
import { numberWithCommas } from 'lib/utils/numberWithCommas'
import React from 'react'

export const ProposalCreationUI = (props) => {
  return (
    <>
      <ProposalCreationMinimumRequirementBanner />
      <PageTitleAndBreadcrumbs
        title={`Create a new proposal`}
        breadcrumbs={[
          {
            href: '/',
            as: '/',
            name: 'Proposals'
          }
        ]}
      />
      <ProposalCreationForm />
    </>
  )
}

const ProposalCreationMinimumRequirementBanner = () => {
  const { isFetched, userCanCreateProposal } = useUserCanCreateProposal()
  const { data: governorAlpha } = useGovernorAlpha()

  if (!isFetched || userCanCreateProposal) return null

  const proposalThreshold = numberWithCommas(
    ethers.utils.formatUnits(governorAlpha.proposalThreshold, DEFAULT_TOKEN_PRECISION),
    { precision: 0 }
  )

  return (
    <Banner theme='purplePinkBorder' outerClassName='mb-8' innerClassName='text-center'>
      <h6>
        📣 In order to submit a proposal you must have at least {proposalThreshold} POOL tokens
        delegated to you 📣
      </h6>
      <a>More about POOL</a>
    </Banner>
  )
}
