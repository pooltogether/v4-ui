import gql from 'graphql-tag'

import { controlledTokenFragment } from 'lib/fragments/controlledTokenFragment'

export const accountFragment = gql`
  fragment accountFragment on Account {
    id

    controlledTokenBalances {
      id
      balance
      controlledToken {
        ...controlledTokenFragment
      }
    }

    prizePoolAccounts {
      id
      timelockedBalance
      unlockTimestamp

      prizePool {
        id
      }
    }
  }
  ${controlledTokenFragment}
`
