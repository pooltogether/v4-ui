import gql from 'graphql-tag'

export const erc1155BalanceFragment = gql`
  fragment erc1155BalanceFragment on ERC1155Balance {
    id
    balance
    tokenId

    erc1155Entity {
      id
    }
  }
`
