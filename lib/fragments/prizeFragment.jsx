import gql from 'graphql-tag'

import { awardedControlledTokenFragment } from 'lib/fragments/awardedControlledTokenFragment'
import { awardedExternalErc20TokenFragment } from 'lib/fragments/awardedExternalErc20TokenFragment'
import { awardedExternalErc721NftFragment } from 'lib/fragments/awardedExternalErc721NftFragment'

export const prizeFragment = gql`
  fragment prizeFragment on Prize {
    id

    awardedTimestamp
    awardedBlock

    totalTicketSupply
    prizePeriodStartedTimestamp

    lockBlock

    awardedControlledTokens {
      ...awardedControlledTokenFragment
    }

    awardedExternalErc20Tokens {
      ...awardedExternalErc20TokenFragment
    }
    
    awardedExternalErc721Nfts {
      ...awardedExternalErc721NftFragment
    }
  }
  ${awardedControlledTokenFragment}
  ${awardedExternalErc20TokenFragment}
  ${awardedExternalErc721NftFragment}
`
