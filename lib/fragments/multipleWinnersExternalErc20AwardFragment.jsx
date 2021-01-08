import gql from 'graphql-tag'

export const multipleWinnersExternalErc20AwardFragment = gql`
  fragment multipleWinnersExternalErc20AwardFragment on MultipleWinnersExternalErc20Award {
    id

    address

    name
    symbol
    decimals
  }
`
