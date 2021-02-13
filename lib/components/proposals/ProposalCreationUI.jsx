import React from 'react'
import FeatherIcon from 'feather-icons-react'
import { ethers } from 'ethers'
import classnames from 'classnames'

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

  const { isFetched, userCanCreateProposal } = useUserCanCreateProposal()
  
  return (
    <>
      <ProposalCreationMinimumRequirementBanner />

      <div className={classnames('trans', { 'opacity-40': isFetched && !userCanCreateProposal })}>
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
      </div>
      
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
          <FeatherIcon icon='alert-circle' className='text-red w-8 h-8 mx-auto' strokeWidth='0.15rem' />
        {' '}{t('inOrderToSubmitAProposalYouNeedDelegatedThreshold', { proposalThreshold })}{' '}
      </h6>
      <a>{t('moreAboutToken')}</a>
    </Banner>
  )
}
