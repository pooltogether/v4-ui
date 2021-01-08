import gql from 'graphql-tag'

export const sponsorFragment = gql`
  fragment sponsorFragment on Sponsor {
    id

    address
    balance
  }
`
