import gql from 'graphql-tag'

export const balanceDripFragment = gql`
  fragment balanceDripFragment on BalanceDrip {
    id

    comptroller {
      id
    }

    sourceAddress
    measureToken
    dripToken
    
    dripRatePerSecond
    exchangeRateMantissa
    timestamp
    deactivated
  }
`