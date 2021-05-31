import React from 'react'
import FeatherIcon from 'feather-icons-react'

import { Card } from 'lib/components/Card'
import { useTranslation } from 'react-i18next'
import { usePoolPoolBalance } from 'lib/hooks/usePoolPoolBalance'
import { getPoolPoolSnapshotId } from 'lib/utils/getPoolPoolSnapshotId'
import { usePoolPoolProposal } from 'lib/hooks/usePoolPoolProposal'
import { useOnboard } from '@pooltogether/hooks'
import { ButtonLink } from 'lib/components/ButtonLink'
import { POOLPOOL_SNAPSHOT_URL, POOLPOOL_URL } from 'lib/constants'
import PoolIcon from 'assets/images/pool-icon.svg'
import { useTimeCountdown } from 'lib/hooks/useTimeCountdown'
import { getSecondsSinceEpoch } from 'lib/utils/getCurrentSecondsSinceEpoch'
import { TimeCountDown } from 'lib/components/TimeCountDown'
import { Tooltip } from 'lib/components/Tooltip'
import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import { getPrecision, numberWithCommas } from 'lib/utils/numberWithCommas'
import { useGovernanceChainId } from 'lib/hooks/useGovernanceChainId'

const POOLPOOL_PROPOSAL_STATES = Object.freeze({
  active: 'active',
  closed: 'closed'
})

export const PoolPoolProposalCard = (props) => {
  const { proposal, snapshotBlockNumber } = props
  const { id } = proposal
  const { t } = useTranslation()
  const { address: usersAddress } = useOnboard()
  const chainId = useGovernanceChainId()
  const poolPoolSnapShotId = getPoolPoolSnapshotId(chainId, id)
  const { data: poolPoolProposal, isFetched: isFetched } = usePoolPoolProposal(chainId, id)
  const { data: poolPoolData, isFetched: poolPoolDataIsFetched } = usePoolPoolBalance(
    usersAddress,
    snapshotBlockNumber
  )

  if (!poolPoolSnapShotId) {
    return null
  } else if (!isFetched || !poolPoolDataIsFetched) {
    return (
      <Card>
        <V3LoadingDots />
      </Card>
    )
  }

  const { state, end } = poolPoolProposal.proposal

  const votingPower = numberWithCommas(poolPoolData.amount, {
    precision: getPrecision(poolPoolData.amount)
  })

  return (
    <Card className='flex flex-col xs:flex-row xs:justify-between'>
      <div className='flex flex-col'>
        <span className='flex'>
          <img src={PoolIcon} className='rounded-full w-4 h-4 xs:w-6 xs:h-6 my-auto mr-2' />
          <h6>{t('poolPoolGasFreeVote')}</h6>
          <Tooltip className='my-auto ml-2 text-inverse' tip={t('depositIntoPoolPoolTooltip')} />
        </span>

        {poolPoolDataIsFetched && poolPoolData && poolPoolData.hasBalance && (
          <span className='text-accent-1 mt-2'>
            <span className='mr-2'>{t('myPoolPoolVotingPower')}</span>
            <b>{votingPower}</b>
          </span>
        )}
        <SnapshotVoteTime end={end} />
      </div>
      <div className='mt-4 xs:mt-0 flex flex-col'>
        <div className='mb-4 flex rounded px-4 py-1 w-fit-content h-fit-content bg-tertiary font-bold'>
          <FeatherIcon icon='alert-circle' className='mr-2 my-auto w-4 h-4' />
          {t('votingPowerIsLockedFromBlock', { blockNumber: snapshotBlockNumber })}
        </div>
        <div className='flex flex-row xs:flex-col'>
          <PoolPoolSnapshotLinkButton state={state} snapShotId={poolPoolSnapShotId} />
          <ButtonLink
            target='_blank'
            rel='noopener noreferrer'
            border='transparent'
            text='green'
            hoverText='primary'
            hoverBg='green'
            hoverBorder='transparent'
            padding='px-2 xs:px-4 sm:px-6 lg:px-8 py-1'
            textSize='xs'
            href={POOLPOOL_URL}
            className='flex justify-center'
          >
            <span className='my-auto'>{t('goToPoolPool')}</span>
            <FeatherIcon
              icon={'external-link'}
              className='relative w-4 h-4 inline-block my-auto ml-2'
            />
          </ButtonLink>
        </div>
      </div>
    </Card>
  )
}

const SnapshotVoteTime = (props) => {
  const { end } = props
  const { t } = useTranslation()
  const initialSecondsLeft = end - getSecondsSinceEpoch()
  const { days, hours, minutes, secondsLeft } = useTimeCountdown(initialSecondsLeft)

  if (secondsLeft > 0) {
    return (
      <span className='flex text-accent-1'>
        <span className='mt-auto'>{t('justEndsIn')} </span>
        <TimeCountDown endTime={end} />
      </span>
    )
  }

  const endDate = new Date(end * 1000)
  return (
    <span className='text-accent-1 my-2'>
      {t('endedOn')} {`${endDate.toLocaleString()}`}
    </span>
  )
}

const PoolPoolSnapshotLinkButton = (props) => {
  const { snapShotId, state } = props
  const { t } = useTranslation()

  return (
    <ButtonLink
      target='_blank'
      rel='noopener noreferrer'
      border='transparent'
      text='green'
      hoverText='primary'
      hoverBg='green'
      hoverBorder='transparent'
      padding='px-2 xs:px-4 sm:px-6 lg:px-8 py-1'
      textSize='xs'
      href={`${POOLPOOL_SNAPSHOT_URL}/proposal/${snapShotId}`}
      className='flex xs:mb-2 justify-center'
    >
      <span className='my-auto'>
        {state === POOLPOOL_PROPOSAL_STATES.closed ? 'View on Snapshot' : t('voteOnSnapshot')}
      </span>
      <FeatherIcon icon={'external-link'} className='relative w-4 h-4 inline-block my-auto ml-2' />
    </ButtonLink>
  )
}
