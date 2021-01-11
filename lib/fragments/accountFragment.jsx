import gql from 'graphql-tag'

export const accountFragment = gql`
  fragment accountFragment on Account {
    id

    controlledTokenBalances {
      id
      balance
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
`
