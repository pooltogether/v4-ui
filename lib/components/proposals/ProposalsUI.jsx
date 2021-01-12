import React, { useContext } from 'react'

import { useTranslation } from 'lib/../i18n'

import { useGovernanceData } from 'lib/hooks/useGovernanceData'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { Button } from 'lib/components/Button'
import { ProposalsList } from 'lib/components/proposals/ProposalsList'
import { useAllProposals } from 'lib/hooks/useAllProposals'
import { V3LoadingDots } from 'lib/components/V3LoadingDots'

export const ProposalsUI = (props) => {
  const { t } = useTranslation()

  const { connectWallet, usersAddress } = useContext(AuthControllerContext)

  const { loading, data: proposals } = useAllProposals()

  if (loading) {
    return <V3LoadingDots />
  }

  return (
    <>
      {/* TODO: Remove this */}
      {!usersAddress && (
        <Button
          textSize='lg'
          onClick={(e) => {
            e.preventDefault()
            connectWallet()
          }}
        >
          {t('connectWallet')}
        </Button>
      )}

      <h1>Proposals</h1>
      <p className='mb-4'>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus sit amet congue eros, vel
        ornare enim. Fusce quis feugiat urna, iaculis congue justo. Integer leo enim, vulputate quis
        magna vitae, ullamcorper porttitor diam. Quisque congue arcu risus, in tincidunt erat
        vulputate dignissim. Nunc non condimentum nunc. Pellentesque ipsum leo, tincidunt sed
        ullamcorper ut, fermentum quis erat. Duis vel urna efficitur, condimentum erat et, venenatis
        neque. Etiam nibh diam, ultricies id mattis sit amet, placerat sit amet risus. Nam at odio
        sagittis massa vehicula faucibus et in mauris. Quisque placerat malesuada velit, quis
        vehicula odio maximus posuere. Vestibulum ac sagittis diam. Nunc non pretium turpis.
        Maecenas ac leo rhoncus, gravida ipsum quis, dapibus leo.
      </p>

      <ProposalsList proposals={proposals} />
    </>
  )
}
