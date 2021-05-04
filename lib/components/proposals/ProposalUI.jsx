import React, { useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import GovernorAlphaABI from 'abis/GovernorAlphaABI'
import ReactMarkdown from 'react-markdown'
import classnames from 'classnames'
import gfm from 'remark-gfm'
import { useRouter } from 'next/router'

import { useTranslation } from 'lib/../i18n'
import { CONTRACT_ADDRESSES, DEFAULT_TOKEN_PRECISION, PROPOSAL_STATUS } from 'lib/constants'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { AddGovernanceTokenToMetaMask } from 'lib/components/AddGovernanceTokenToMetaMask'
import { Button } from 'lib/components/Button'
import { PageTitleAndBreadcrumbs } from 'lib/components/PageTitleAndBreadcrumbs'
import { Card } from 'lib/components/Card'
import { ProposalStatus } from 'lib/components/proposals/ProposalsList'
import { PTHint } from 'lib/components/PTHint'
import { TxText } from 'lib/components/TxText'
import { UsersPoolVotesCard } from 'lib/components/UsersPoolVotesCard'
import { VotersTable } from 'lib/components/proposals/VotersTable'
import { useProposalData } from 'lib/hooks/useProposalData'
import { useProposalVotes } from 'lib/hooks/useProposalVotes'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useTokenHolder } from 'lib/hooks/useTokenHolder'
import { useVoteData } from 'lib/hooks/useVoteData'
import { calculateVotePercentage, formatVotes } from 'lib/utils/formatVotes'
import { useTransaction } from 'lib/hooks/useTransaction'
import { useInterval } from 'lib/hooks/useInterval'
import { getSecondsSinceEpoch } from 'lib/utils/getCurrentSecondsSinceEpoch'
import { ethers } from 'ethers'
import { useEtherscanAbi } from 'lib/hooks/useEtherscanAbi'
import { EtherscanAddressLink } from 'lib/components/EtherscanAddressLink'
import { shorten } from 'lib/utils/shorten'
import { useGovernorAlpha } from 'lib/hooks/useGovernorAlpha'
import { numberWithCommas } from 'lib/utils/numberWithCommas'
import { useProposalVotesTotalPages } from 'lib/hooks/useProposalVotesTotalPages'
import { TimeCountDown } from 'lib/components/TimeCountDown'

const SMALL_DESCRIPTION_LENGTH = 500

export const ProposalUI = (props) => {
  const { t } = useTranslation()

  const router = useRouter()
  const { id } = router.query

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { refetch: refetchProposalData, proposal, isFetched, error } = useProposalData(id)

  if (!proposal || (!proposal && !isFetched)) {
    return null
  }

  return (
    <>
      <PageTitleAndBreadcrumbs
        title={t('proposals')}
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
            name: t('proposalId', { id })
          }
        ]}
      />
      <UsersPoolVotesCard blockNumber={Number(proposal.startBlock)} className='mb-8' />
      <ProposalVoteCard
        blockNumber={Number(proposal.startBlock)}
        proposal={proposal}
        refetchProposalData={refetchProposalData}
      />
      <ProposalDescriptionCard proposal={proposal} />
      <ProposalActionsCard proposal={proposal} />
      <VotesCard proposal={proposal} isFetched={isFetched} id={id} />

      <AddGovernanceTokenToMetaMask />
    </>
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
      <Card title={t('details')}>
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

const ProposalVoteCard = (props) => {
  const { proposal, refetchProposalData, blockNumber } = props

  const { t } = useTranslation()
  const { id, title, status } = proposal

  const { usersAddress } = useContext(AuthControllerContext)
  const { data: tokenHolderData } = useTokenHolder(usersAddress, blockNumber)
  const { data: voteData, isFetched: voteDataIsFetched, refetch: refetchVoteData } = useVoteData(
    tokenHolderData?.delegateAddress,
    id
  )

  console.log(voteData, tokenHolderData)

  const refetchData = () => {
    refetchVoteData()
    refetchProposalData()
  }

  const showButtons =
    usersAddress &&
    (status === PROPOSAL_STATUS.active ||
      status === PROPOSAL_STATUS.succeeded ||
      status === PROPOSAL_STATUS.queued)

  return (
    <Card>
      <div className='flex justify-between flex-col-reverse sm:flex-row'>
        <h4 className={classnames('mr-2', { 'mb-2 sm:mb-8': showButtons })}>{title}</h4>
        <ProposalStatus proposal={proposal} />
      </div>
      {voteDataIsFetched && voteData?.delegateDidVote && (
        <div className='flex my-auto mt-2'>
          <h6 className='font-normal mr-2 sm:mr-4'>{t('myVote')}:</h6>
          <div
            className={classnames('flex my-auto', {
              'text-green': voteData.support,
              'text-red': !voteData.support
            })}
          >
            <FeatherIcon
              icon={voteData.support ? 'check-circle' : 'x-circle'}
              className='w-6 h-6 mr-2'
            />
            <p className='font-bold'>{voteData.support ? t('accept') : t('reject')}</p>
          </div>
        </div>
      )}

      {showButtons && (
        <>
          {status === PROPOSAL_STATUS.active && (
            <VoteButtons
              id={id}
              refetchData={refetchData}
              canVote={tokenHolderData?.canVote}
              alreadyVoted={voteData?.delegateDidVote}
            />
          )}
          {status === PROPOSAL_STATUS.succeeded && (
            <QueueButton id={id} refetchData={refetchData} />
          )}
          {status === PROPOSAL_STATUS.queued && (
            <ExecuteButton
              id={id}
              refetchData={refetchData}
              executionETA={Number(proposal?.executionETA)}
              proposal={proposal}
            />
          )}
        </>
      )}
    </Card>
  )
}

const VoteButtons = (props) => {
  const { id, refetchData, canVote, alreadyVoted } = props

  const router = useRouter()
  const page = router?.query?.page ? parseInt(router.query.page, 10) : 1
  const { refetch: refetchTotalVotesPages } = useProposalVotesTotalPages(id)
  const { refetch: refetchVoterTable } = useProposalVotes(id, page)

  const { t } = useTranslation()

  const { chainId } = useContext(AuthControllerContext)
  const sendTx = useSendTransaction()
  const [txId, setTxId] = useState(0)
  const [votingFor, setVotingFor] = useState()
  const governanceAddress = CONTRACT_ADDRESSES[chainId].GovernorAlpha
  const tx = useTransaction(txId)

  const handleVoteFor = (e) => {
    e.preventDefault()
    setVotingFor(true)
    castVote(true)
  }

  const handleVoteAgainst = (e) => {
    e.preventDefault()
    setVotingFor(false)
    castVote(false)
  }

  const refetch = () => {
    refetchData()
    refetchTotalVotesPages()
    refetchVoterTable()
  }

  const castVote = async (support) => {
    const params = [id, support]

    const name = t('sendVoteForProposalId', { support: support ? t('accept') : t('reject'), id })

    const txId = await sendTx({
      name,
      contractAbi: GovernorAlphaABI,
      contractAddress: governanceAddress,
      method: 'castVote',
      params,
      callbacks: {
        refetch
      }
    })
    setTxId(txId)
  }

  if (!canVote || alreadyVoted) {
    return null
  }

  if (tx?.completed && !tx?.error && !tx?.cancelled) {
    return (
      <TxText className='text-green ml-auto'>
        🎉 {t('successfullyVoted')} - {votingFor ? t('accept') : t('reject')} 🎉
      </TxText>
    )
  }

  if (tx?.inWallet && !tx?.cancelled && !tx?.error) {
    return <TxText className='ml-auto'>{t('pleaseConfirmInYourWallet')}</TxText>
  }

  if (tx?.sent) {
    return <TxText className='ml-auto'>{t('waitingForConfirmations')}...</TxText>
  }

  return (
    <div className='flex mt-2 justify-end'>
      {tx?.error && (
        <div className='text-red flex'>
          <FeatherIcon icon='alert-triangle' className='h-4 w-4 stroke-current my-auto mr-2' />
          <p>{t('errorWithTxPleaseTryAgain')}</p>
        </div>
      )}
      <Button
        border='green'
        text='primary'
        bg='green'
        hoverBorder='green'
        hoverText='primary'
        hoverBg='green'
        onClick={handleVoteFor}
        className='mr-4'
      >
        <div className='flex'>
          <FeatherIcon icon='check-circle' className='my-auto mr-2 h-4 w-4 sm:h-6 sm:w-6' />
          {t('accept')}
        </div>
      </Button>
      <Button
        border='red'
        text='red'
        bg='transparent'
        hoverBorder='red'
        hoverText='red'
        hoverBg='transparent'
        onClick={handleVoteAgainst}
      >
        <div className='flex'>
          <FeatherIcon icon='x-circle' className='my-auto mr-2 h-4 w-4 sm:h-6 sm:w-6' />
          {t('reject')}
        </div>
      </Button>
    </div>
  )
}

const QueueButton = (props) => {
  const { id, refetchData } = props

  const { t } = useTranslation()
  const { chainId } = useContext(AuthControllerContext)
  const sendTx = useSendTransaction()
  const [txId, setTxId] = useState(0)
  const governanceAddress = CONTRACT_ADDRESSES[chainId].GovernorAlpha
  const tx = useTransaction(txId)

  const handleQueueProposal = async (e) => {
    e.preventDefault()

    const params = [id]

    const txId = await sendTx({
      name: t('queueProposal', { id }),
      contractAbi: GovernorAlphaABI,
      contractAddress: governanceAddress,
      method: 'queue',
      params,
      callbacks: {
        refetch: refetchData
      }
    })
    setTxId(txId)
  }

  if (tx?.completed && !tx?.error && !tx?.cancelled) {
    // Successfully Queued Proposal #{ id }
    return (
      <TxText className='text-green ml-auto'>
        🎉 {t('successfullyQueuedProposalId', { id })} 🎉
      </TxText>
    )
  }

  if (tx?.inWallet && !tx?.cancelled && !tx?.error) {
    return <TxText className='ml-auto'>{t('pleaseConfirmInYourWallet')}</TxText>
  }

  if (tx?.sent) {
    return <TxText className='ml-auto'>{t('waitingForConfirmations')}...</TxText>
  }

  return (
    <div className='flex mt-2 justify-end'>
      {tx?.error && (
        <PTHint
          tip={
            <div className='flex'>
              <p>{t('errorWithTxPleaseTryAgain')}</p>
            </div>
          }
        >
          <FeatherIcon
            icon='alert-triangle'
            className='h-4 w-4 text-red stroke-current my-auto mr-2'
          />
        </PTHint>
      )}
      <Button onClick={handleQueueProposal}>{t('queueProposal')}</Button>
    </div>
  )
}

const ExecuteButton = (props) => {
  const { id, refetchData, executionETA, proposal } = props

  const { t } = useTranslation()
  const { chainId } = useContext(AuthControllerContext)
  const sendTx = useSendTransaction()
  const [txId, setTxId] = useState(0)
  const governanceAddress = CONTRACT_ADDRESSES[chainId].GovernorAlpha
  const tx = useTransaction(txId)

  const [currentTime, setCurrentTime] = useState(getSecondsSinceEpoch())

  useInterval(() => {
    setCurrentTime(getSecondsSinceEpoch())
  }, 1000)

  const payableAmountInWei = useMemo(
    () =>
      proposal.values.reduce(
        (totalPayableAmount, currentPayableAmount) =>
          totalPayableAmount.add(ethers.BigNumber.from(currentPayableAmount)),
        ethers.BigNumber.from(0)
      ),
    [proposal.values]
  )
  const payableAmountInEther = ethers.utils.formatEther(payableAmountInWei)

  const handleExecuteProposal = async (e) => {
    e.preventDefault()

    const params = [id]

    const txId = await sendTx({
      name: t('executeProposalId', { id }),
      contractAbi: GovernorAlphaABI,
      contractAddress: governanceAddress,
      method: 'execute',
      params,
      callbacks: {
        refetch: refetchData
      },
      value: payableAmountInWei.toHexString()
    })
    setTxId(txId)
  }

  if (tx?.completed && !tx?.error && !tx?.cancelled) {
    return (
      <TxText className='text-green ml-auto'>
        🎉 {t('successfullyExecutedProposalId', { id })} 🎉
      </TxText>
    )
  }

  if (tx?.inWallet && !tx?.cancelled && !tx?.error) {
    return <TxText className='ml-auto'>{t('pleaseConfirmInYourWallet')}</TxText>
  }

  if (tx?.sent) {
    return <TxText className='ml-auto'>{t('waitingForConfirmations')}...</TxText>
  }

  return (
    <>
      {currentTime < executionETA && (
        <div className='flex'>
          <span className='xs:ml-auto mt-auto text-accent-1'>{t('executableIn')}</span>
          <TimeCountDown endTime={executionETA} />
        </div>
      )}
      <div className='flex mt-2 justify-end'>
        {tx?.error && (
          <PTHint
            tip={
              <div className='flex'>
                <p>{t('errorWithTxPleaseTryAgain')}</p>
              </div>
            }
          >
            <FeatherIcon
              icon='alert-triangle'
              className='h-4 w-4 text-red stroke-current my-auto mr-2'
            />
          </PTHint>
        )}
        {!payableAmountInWei.isZero() && (
          <PTHint
            tip={
              <div className='flex'>
                <p>{t('executionCostInEth', { amount: payableAmountInEther.toString() })}</p>
              </div>
            }
          >
            <FeatherIcon
              icon='alert-circle'
              className='h-4 w-4 text-inverse stroke-current my-auto mr-2'
            />
          </PTHint>
        )}
        <Button
          border='green'
          text='primary'
          bg='green'
          hoverBorder='green'
          hoverText='primary'
          hoverBg='green'
          onClick={handleExecuteProposal}
          disabled={currentTime < executionETA}
        >
          {t('executeProposal')}
        </Button>
      </div>
    </>
  )
}
