import React, { useContext } from 'react'
import FeatherIcon from 'feather-icons-react'
import { useGovernanceData } from 'lib/hooks/useGovernanceData'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { Button } from 'lib/components/Button'
import { ProposalsList } from 'lib/components/proposals/ProposalsList'
import { useAllProposals } from 'lib/hooks/useAllProposals'
import { V3LoadingDots } from 'lib/components/V3LoadingDots'
import { useRouter } from 'next/router'
import { useDelegateData } from 'lib/hooks/useDelegateData'
import { Card } from 'lib/components/Card'
import { formatVotes } from 'lib/utils/formatVotes'
import { useTokenHolder } from 'lib/hooks/useTokenHolder'
import { ButtonLink } from 'lib/components/ButtonLink'
import { GovernanceNav } from 'lib/components/GovernanceNav'
import { useSocialIdentity } from 'lib/hooks/useTwitterProfile'

// TODO: Smart contract case. Case when address isn't a token holder but is a delegate
export const DelegateUI = (props) => {
  const router = useRouter()
  const { address } = router.query

  const { data, isFetched, isFetching, error, loading } = useTokenHolder(address)

  if (!address || loading) {
    return <V3LoadingDots />
  }

  const tokenBalance = data?.tokenBalance ?? 0
  const delegate = data?.delegate ?? {}

  return (
    <>
      <GovernanceNav />
      <Card>
        <h5>{address}</h5>
        <div className='flex flex-col'>
          <h6>Token Balance</h6>
          {tokenBalance ?? 0}
        </div>
      </Card>
      <DelegationCard address={address} delegateAddress={delegate?.id} />
    </>
  )
}

const DelegationCard = (props) => (
  <Card>
    <h5>Delegation</h5>
    <DelegationControls {...props} />
  </Card>
)

const DelegationControls = (props) => {
  const { address, delegateAddress } = props

  const { data, loading, error } = useDelegateData(delegateAddress)
  const identity = useSocialIdentity(delegateAddress)

  if (loading) {
    return null
  }

  const { delegatedVotesRaw } = data.delegate

  if (!delegateAddress) {
    return <>Currently Not Delegating</>
  }

  if (delegateAddress === address) {
    return (
      <>
        <div>Self Delegating</div>
        <div>Voting Power: {formatVotes(delegatedVotesRaw)}</div>
      </>
    )
  }

  // <h6>Votes</h6>
  // {formatVotes(delegatedVotesRaw)}

  return (
    <div className='flex justify-between'>
      <div className='flex flex-col'>
        <div>
          Delegating to{' '}
          {identity.twitter && (
            <a
              href={`https://twitter.com/${identity.twitter.handle}`}
              target='_blank'
              rel='noopener'
            >
              {identity.twitter.handle}
            </a>
          )}{' '}
          ({delegateAddress})
        </div>
        <div>Voting Power: {formatVotes(delegatedVotesRaw)}</div>
      </div>

      <ButtonLink as={`/delegate/${delegateAddress}`} href='/delegate/[address]'>
        View
      </ButtonLink>
    </div>
  )
}

// const TwitterProfile = (props) => {
//   const { address } = props
//   const { loading, data } = useTwitterProfile(address)
//   if (loading) {
//     return null
//   }

//   const { name, profile_image_url, username } = data.data

//   return (
//     <div className='flex flex-row mb-4'>
//       <img src={profile_image_url} className='rounded-full w-8 h-8 mr-2' />
//       <FeatherIcon icon='twitter' className='stroke-1 w-8 h-8 mr-2' />
//       {name}
//     </div>
//   )
// }
