import gql from 'graphql-tag'

export const awardedExternalErc721NftFragment = gql`
  fragment awardedExternalErc721NftFragment on AwardedExternalErc721Nft {
    id
    address
    tokenIds
  }
`
