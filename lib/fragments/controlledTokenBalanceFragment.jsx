import gql from 'graphql-tag'

export const controlledTokenBalanceFragment = gql`
  fragment controlledTokenBalanceFragment on ControlledTokenBalance {
    id
    balance
  }
`
