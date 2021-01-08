import gql from 'graphql-tag'

export const volumeDripFragment = gql`
  fragment volumeDripFragment on VolumeDrip {
    id

    comptroller {
      id
    }

    sourceAddress
    measureToken
    dripToken

    referral
    periodSeconds
    dripAmount
    
    periodCount
    deactivated
  }
`
