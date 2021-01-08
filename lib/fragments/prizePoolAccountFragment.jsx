import gql from 'graphql-tag'

export const prizePoolAccountFragment = gql`
  fragment prizePoolAccountFragment on PrizePoolAccount {
    id

    timelockedBalance
    unlockTimestamp
  }
`
