import gql from 'graphql-tag'

export const singleRandomWinnerExternalErc20AwardFragment = gql`
  fragment singleRandomWinnerExternalErc20AwardFragment on SingleRandomWinnerExternalErc20Award {
    id

    address

    name
    symbol
    decimals
  }
`
