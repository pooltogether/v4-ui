import gql from 'graphql-tag'

// export const transactionFragment = gql`
//   fragment transactionFragment on Transaction {
//     __typename
//     id
//     name
//     ethersTx
//     completed
//     hash
//     chainId
//     sent
//     inWallet
//     method
//   }
// `

export const gasStationDataQuery = gql`
  query {
    gasStationData @client
  }
`
