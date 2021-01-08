import gql from 'graphql-tag'

export const erc721TokenFragment = gql`
  fragment erc721TokenFragment on ERC721Token {
    id
    tokenId
    
    erc721Entity {
      id
      isLootBox
      name
      uri
    }
  }
`
