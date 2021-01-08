import gql from 'graphql-tag'

export const singleRandomWinnerExternalErc721AwardFragment = gql`
  fragment singleRandomWinnerExternalErc721AwardFragment on SingleRandomWinnerExternalErc721Award {
    id
    address
    tokenIds
  }
`
