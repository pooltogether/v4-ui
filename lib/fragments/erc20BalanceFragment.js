import gql from 'graphql-tag'

export const erc20BalanceFragment = gql`
  fragment erc20BalanceFragment on ERC20Balance {
    id
    balance
    
    erc20Entity {
      id
      name
      symbol
      decimals
    }
  }
`
