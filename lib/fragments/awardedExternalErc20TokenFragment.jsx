import gql from 'graphql-tag'

export const awardedExternalErc20TokenFragment = gql`
  fragment awardedExternalErc20TokenFragment on AwardedExternalErc20Token {
    id

    address
    balanceAwarded

    name
    symbol
    decimals
  }
`
