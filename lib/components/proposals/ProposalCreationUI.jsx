import React from 'react'
import { ethers } from 'ethers'

import { useTranslation } from 'lib/../i18n'
import { Banner } from 'lib/components/Banner'
import { PageTitleAndBreadcrumbs } from 'lib/components/PageTitleAndBreadcrumbs'
import { ProposalCreationForm } from 'lib/components/proposals/ProposalCreationForm'
import { DEFAULT_TOKEN_PRECISION } from 'lib/constants'
import { useGovernorAlpha } from 'lib/hooks/useGovernorAlpha'
import { usePoolTokenData } from 'lib/hooks/usePoolTokenData'
import { useUserCanCreateProposal } from 'lib/hooks/useUserCanCreateProposal'
import { numberWithCommas } from 'lib/utils/numberWithCommas'

export const ProposalCreationUI = (props) => {
  const { t } = useTranslation()

  return (
    <>
      <ProposalCreationMinimumRequirementBanner />
      <PageTitleAndBreadcrumbs
        title={t('createANewProposal')}
        breadcrumbs={[
          {
            href: '/',
            as: '/',
            name: t('proposals')
          }
        ]}
      />
      <ProposalCreationForm />
    </>
  )
}

const ProposalCreationMinimumRequirementBanner = () => {
  const { t } = useTranslation()

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
        <span className='mr-2'>📣</span>{' '}{t('inOrderToSubmitAProposalYouNeedDelegatedThreshold', { proposalThreshold })}{' '}<span className='ml-2'>📣</span>
      </h6>
      <a>{t('moreAboutToken')}</a>
    </Banner>
  )
}
