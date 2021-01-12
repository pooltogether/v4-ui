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

export const DelegateUI = (props) => {
  const router = useRouter()
  console.log(router)
  const { address } = router.query

  const { data, isFetched, isFetching, error, loading } = useTokenHolder(address)

  if (!address || loading) {
    return <V3LoadingDots />
  }

  console.log(data, address, error)

  const { tokenBalance, delegate } = data.tokenHolder

  return (
    <>
      <Card>
        <h5>{address}</h5>
        <div className='flex flex-col'>
          <h6>Token Balance</h6>
          {tokenBalance}
        </div>
        <Delegate address={delegate.id} />
      </Card>
    </>
  )
}

const Delegate = (props) => {
  const { address } = props

  const { data, loading, error } = useDelegateData(address)

  // TODO: No delegate case
  // ALlow for changing

  if (loading) {
    return null
  }

  const { delegatedVotesRaw } = data.delegate

  return (
    <div className='mt-8'>
      <h5>Delegate</h5>
      <ButtonLink as={`/delegate/${address}`} href='/delegate/[address]'>
        {address}
      </ButtonLink>
      <h6>Votes</h6>
      {formatVotes(delegatedVotesRaw)}
    </div>
  )
}
