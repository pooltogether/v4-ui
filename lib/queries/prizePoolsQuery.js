import gql from 'graphql-tag'

import { prizePoolFragment } from 'lib/fragments/prizePoolFragment'

export const prizePoolsQuery = (number) => {
  const blockFilter = number > 0 ? `, block: { number: ${number} }` : ''

  return gql`
    query prizePoolsQuery($poolAddresses: [String!]!) {
      prizePools(where: { id_in: $poolAddresses } ${blockFilter}) {
        ...prizePoolFragment
      }
    }
    ${prizePoolFragment}
  `
}