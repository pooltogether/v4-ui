import React, { useContext, useEffect } from 'react'
import { ethers } from 'ethers'
import classnames from 'classnames'

import { useTranslation } from 'lib/../i18n'
import { DEFAULT_TOKEN_PRECISION } from 'lib/constants'
import { WalletContext } from 'lib/components/contextProviders/WalletContextProvider'
import { Banner } from 'lib/components/Banner'
import { PageTitleAndBreadcrumbs } from 'lib/components/PageTitleAndBreadcrumbs'
import { ProposalCreationForm } from 'lib/components/proposals/ProposalCreationForm'
import { useGovernorAlpha } from 'lib/hooks/useGovernorAlpha'
import { useUserCanCreateProposal } from 'lib/hooks/useUserCanCreateProposal'
import { numberWithCommas } from 'lib/utils/numberWithCommas'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { Button } from 'lib/components/Button'

export const ProposalCreationUI = (props) => {
  const { t } = useTranslation()

  return (
    <>
      <ProposalCreationMinimumRequirementBanner />

      <div className={classnames('trans mb-12')}>
        <PageTitleAndBreadcrumbs
          title={t('createANewProposal')}
          breadcrumbs={[
            {
              href: '/',
              as: '/',
              name: t('vote')
            },
            {
              href: '/',
              as: '/',
              name: t('proposals')
            },
            {
              href: '/proposals/create',
              as: '/proposals/create',
              name: t('createProposal')
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

  const { handleLoadOnboard } = useContext(WalletContext)

  const { usersAddress, connectWallet } = useContext(AuthControllerContext)
  const { isFetched, userCanCreateProposal } = useUserCanCreateProposal()
  const { data: governorAlpha } = useGovernorAlpha()

  useEffect(() => {
    handleLoadOnboard()
  }, [])

  // TODO: Add links for 'more about token'

  if (!usersAddress) {
    return (
      <Banner
        theme='purplePinkBorder'
        outerClassName='mb-8'
        innerClassName='text-center flex flex-col'
      >
        <h2>🗳</h2>
        <h6>{t('connectAWalletToCreateAProposal')}</h6>
        <a
          href='https://medium.com/pooltogether/governance-101-fca9ab8b8ba2'
          target='_blank'
          rel='noopener noreferrer'
          title='Governance 101'
        >
          {t('learnMore')}
        </a>
        <Button
          tertiary
          type='button'
          className='mx-auto mt-4 xs:w-5/12 sm:w-1/3 lg:w-1/4'
          textSize='xxxs'
          onClick={() => connectWallet()}
        >
          {t('connectWallet')}
        </Button>
      </Banner>
    )
  }

  if (!isFetched || userCanCreateProposal) return null

  const proposalThreshold = numberWithCommas(
    ethers.utils.formatUnits(governorAlpha.proposalThreshold, DEFAULT_TOKEN_PRECISION),
    { precision: 0 }
  )

  return (
    <Banner theme='purplePinkBorder' outerClassName='mb-8' innerClassName='text-center'>
      <h2>🗳</h2>
      <h6>{t('inOrderToSubmitAProposalYouNeedDelegatedThreshold', { proposalThreshold })} </h6>
      <a
        href='https://medium.com/pooltogether/governance-101-fca9ab8b8ba2'
        target='_blank'
        rel='noopener noreferrer'
        title='Governance 101'
      >
        {t('learnMore')}
      </a>
    </Banner>
  )
}
