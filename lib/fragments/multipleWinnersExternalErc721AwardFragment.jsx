import gql from 'graphql-tag'

export const multipleWinnersExternalErc721AwardFragment = gql`
  fragment multipleWinnersExternalErc721AwardFragment on MultipleWinnersExternalErc721Award {
    id
    address
    tokenIds
  }
`
