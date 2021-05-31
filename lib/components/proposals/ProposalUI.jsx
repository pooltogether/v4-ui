import React, { useEffect, useLayoutEffect, useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import ReactMarkdown from 'react-markdown'
import classnames from 'classnames'
import gfm from 'remark-gfm'
import { useRouter } from 'next/router'

import { useTranslation } from 'react-i18next'
import { DEFAULT_TOKEN_PRECISION } from 'lib/constants'
import { AddGovernanceTokenToMetaMask } from 'lib/components/AddGovernanceTokenToMetaMask'
import { PageTitleAndBreadcrumbs } from 'lib/components/PageTitleAndBreadcrumbs'
import { Card } from 'lib/components/Card'
import { PTHint } from 'lib/components/PTHint'
import { DelegateAddress, UsersPoolVotesCard } from 'lib/components/UsersPoolVotesCard'
import { VotersTable } from 'lib/components/proposals/VotersTable'
import { useProposalData } from 'lib/hooks/useProposalData'
import { calculateVotePercentage, formatVotes } from 'lib/utils/formatVotes'
import { ethers } from 'ethers'
import { useEtherscanAbi } from 'lib/hooks/useEtherscanAbi'
import { EtherscanAddressLink } from 'lib/components/EtherscanAddressLink'
import { shorten } from 'lib/utils/shorten'
import { useGovernorAlpha } from 'lib/hooks/useGovernorAlpha'
import { numberWithCommas } from 'lib/utils/numberWithCommas'
import { ProposalVoteCard } from 'lib/components/proposals/ProposalVoteCard'
import { PoolPoolProposalCard } from 'lib/components/proposals/PoolPoolProposalCard'
import { usePoolPoolProposal } from 'lib/hooks/usePoolPoolProposal'
import { useGovernanceChainId } from 'lib/hooks/useGovernanceChainId'

const SMALL_DESCRIPTION_LENGTH = 500

export const ProposalUI = (props) => {
  const { t } = useTranslation()

  const router = useRouter()
  const { id } = router.query

  const chainId = useGovernanceChainId()

  const { refetch: refetchProposalData, proposal, isFetched, error } = useProposalData(id)
  const { data: poolPoolData, isFetched: poolPoolProposalIsFetched } = usePoolPoolProposal(
    chainId,
    id
  )

  if (!proposal || (!proposal && !isFetched)) {
    return null
  }

  const blockNumber = Number(proposal.startBlock)
  const snapshotBlockNumber = Boolean(poolPoolData?.proposal?.snapshot)
    ? Number(poolPoolData.proposal.snapshot)
    : null

  return (
    <>
      <PageTitleAndBreadcrumbs
        title={t('proposals')}
        breadcrumbs={[
          {
            href: '/',
            as: '/',
            name: t('proposals')
          },
          {
            name: t('proposalId', { id })
          }
        ]}
      />
      <UsersPoolVotesCard
        blockNumber={blockNumber}
        snapshotBlockNumber={snapshotBlockNumber}
        className='mb-8'
      />
      <ProposalVoteCard
        blockNumber={blockNumber}
        proposal={proposal}
        refetchProposalData={refetchProposalData}
      />
      <PoolPoolProposalCard
        proposal={proposal}
        blockNumber={blockNumber}
        snapshotBlockNumber={snapshotBlockNumber}
      />
      <ProposalDescriptionCard proposal={proposal} />
      <ProposalActionsCard proposal={proposal} />
      <ProposalAuthorCard proposal={proposal} />
      <VotesCard proposal={proposal} isFetched={isFetched} id={id} />

      <AddGovernanceTokenToMetaMask />
    </>
  )
}

const ProposalAuthorCard = (props) => {
  const { t } = useTranslation()
  const { proposal } = props
  const { proposer } = proposal
  const { id } = proposer

  return (
    <Card title={t('author')}>
      <DelegateAddress address={id} />
    </Card>
  )
}

const ProposalDescriptionCard = (props) => {
  const { proposal } = props

  const { t } = useTranslation()
  const { description } = proposal
  const smallDescription = description.length < SMALL_DESCRIPTION_LENGTH
  const [showMore, setShowMore] = useState(smallDescription)

  return (
    <>
      <Card title={t('description')}>
        <div
          className={classnames('proposal-details overflow-hidden text-inverse relative')}
          style={{ maxHeight: showMore ? 'unset' : '300px' }}
        >
          {!showMore && (
            <div
              className='w-full h-full absolute'
              style={{
                backgroundImage: showMore
                  ? 'unset'
                  : 'linear-gradient(0deg, var(--color-bg-default) 5%, transparent 100%)'
              }}
            />
          )}
          <ReactMarkdown
            plugins={[gfm]}
            className='description whitespace-pre-wrap break-word'
            children={description}
          />
        </div>
        {!smallDescription && (
          <div className='flex mt-8'>
            <button
              className='mx-auto text-accent-1'
              type='button'
              onClick={(e) => {
                e.preventDefault
                setShowMore(!showMore)
              }}
            >
              {showMore ? t('showLess') : t('showMore')}
            </button>
          </div>
        )}
      </Card>
    </>
  )
}

const ProposalActionsCard = (props) => {
  const { t } = useTranslation()
  const { proposal } = props

  return (
    <Card title={t('actions')}>
      <ul>
        {proposal.signatures.map((signature, index) => {
          return (
            <ProposalActionRow
              key={index}
              actionIndex={index + 1}
              value={proposal.values[index]}
              target={proposal.targets[index]}
              calldata={proposal.calldatas[index]}
              signature={signature}
            />
          )
        })}
      </ul>
    </Card>
  )
}

// TODO: If there are more than 5 actions, this will cause problems since
// etherscan can only accept 5 requests a second
const ProposalActionRow = (props) => {
  const { actionIndex, calldata, signature, value, target } = props

  const [fnParameters, setFnParameters] = useState(null)
  const { t } = useTranslation()
  const { data } = useEtherscanAbi(target)

  const fnName = signature.slice(0, signature.indexOf('('))

  useEffect(() => {
    if (data && data.status === 200 && data.data && data.data.status === '1') {
      try {
        const abi = JSON.parse(data.data.result)
        const iface = new ethers.utils.Interface(abi)
        const fnIface = iface.functions[fnName]
        const sighash = fnIface.sighash
        const fnData = calldata.replace('0x', sighash)
        const parsedData = iface.parseTransaction({ data: fnData })
        setFnParameters(
          parsedData.args.map((arg, index) => {
            const input = { ...fnIface.inputs[index] }
            if (typeof arg === 'object') {
              try {
                input.value = arg.toString()
              } catch (e) {
                input.value = '[object]'
              }
            } else {
              input.value = arg
            }
            return input
          })
        )
      } catch (e) {
        console.warn(e.message)
      }
    }
  }, [data])

  const payableAmount = ethers.utils.formatEther(value)

  return (
    <li className='flex break-all'>
      <b>{`${actionIndex}.`}</b>
      <div className='flex flex-col pl-2 text-accent-1'>
        <div className='w-full flex'>
          <span className='mr-2'>{t('contract')}:</span>
          <EtherscanAddressLink className='text-inverse hover:text-accent-1' address={target}>
            {shorten(target)}
          </EtherscanAddressLink>
        </div>

        <div className='w-full'>
          <span className='mr-2'>{t('function')}:</span>
          <span className='text-inverse'>{signature}</span>
        </div>

        {calldata !== '0x' && (
          <div className='w-full'>
            <span className='mr-2'>{t('inputs')}:</span>
            {fnParameters ? (
              <span className='text-inverse'>
                {fnParameters.map((input) => input.value).join(', ')}
              </span>
            ) : (
              <span className='text-inverse'>{calldata}</span>
            )}
          </div>
        )}

        {value > 0 && (
          <div>
            <span className='mr-2'>{t('payableAmount')}:</span>
            <span className='text-inverse'>{payableAmount} ETH</span>
          </div>
        )}
      </div>
    </li>
  )
}

const VotesCard = (props) => {
  const { id, isFetched, proposal } = props

  const { t } = useTranslation()
  const { data: governorAlpha, isFetched: governorAlphaIsFetched } = useGovernorAlpha()

  if (!isFetched || !governorAlphaIsFetched) {
    return null
  }

  const { forVotes, againstVotes, totalVotes, status } = proposal

  const noVotes = totalVotes.isZero()
  const forPercentage = noVotes ? 0 : calculateVotePercentage(forVotes, totalVotes)
  const againstPercentage = noVotes ? 0 : 100 - forPercentage

  const quorumHasBeenMet = forVotes.gt(governorAlpha.quorumVotes)
  const quorumFormatted = ethers.utils.formatUnits(
    governorAlpha.quorumVotes,
    DEFAULT_TOKEN_PRECISION
  )
  const remainingVotesForQuorum = ethers.utils.formatUnits(
    governorAlpha.quorumVotes.sub(forVotes),
    DEFAULT_TOKEN_PRECISION
  )

  return (
    <>
      <Card title={t('votes')}>
        {!quorumHasBeenMet && (
          <div className='flex text-accent-1 bg-light-purple-10 py-1 px-2 rounded-sm w-fit-content ml-auto mb-6'>
            <span className='mr-2'>
              {t('numVotesNeeded', {
                num: numberWithCommas(remainingVotesForQuorum, { precision: 0 })
              })}
            </span>
            <PTHint
              tip={t('forAProposalToSucceedMinNumOfVotes', {
                num: numberWithCommas(quorumFormatted, {
                  precision: 0
                })
              })}
            >
              <FeatherIcon className='my-auto w-4 h-4 stroke-current' icon='info' />
            </PTHint>
          </div>
        )}

        <div
          className={classnames('w-full h-2 flex flex-row rounded-full overflow-hidden my-4', {
            'opacity-50': !quorumHasBeenMet
          })}
        >
          {!noVotes && (
            <>
              <div className='bg-green' style={{ width: `${forPercentage}%` }} />
              <div className='bg-red' style={{ width: `${againstPercentage}%` }} />
            </>
          )}
          {noVotes && <div className='bg-tertiary w-full' />}
        </div>

        <div
          className={classnames('flex justify-between mb-4 sm:mb-8', {
            'opacity-50': !quorumHasBeenMet
          })}
        >
          <div className='flex text-green'>
            <FeatherIcon
              className='mr-2 my-auto w-8 h-8 sm:w-10 sm:h-10 stroke-current'
              icon='check-circle'
            />
            <div className='flex flex-col'>
              <h5>{t('accept')}</h5>
              <h6 className='font-normal text-xxs sm:text-xs'>{`${formatVotes(
                forVotes
              )} (${forPercentage}%)`}</h6>
            </div>
          </div>
          <div className='flex text-red'>
            <div className='flex flex-col'>
              <h5>{t('reject')}</h5>
              <h6 className='font-normal text-xxs sm:text-xs'>{`${formatVotes(
                againstVotes
              )} (${againstPercentage}%)`}</h6>
            </div>
            <FeatherIcon
              className='ml-2 my-auto w-8 h-8 sm:w-10 sm:h-10 stroke-current'
              icon='x-circle'
            />
          </div>
        </div>

        <VotersTable id={id} />
      </Card>
    </>
  )
}
