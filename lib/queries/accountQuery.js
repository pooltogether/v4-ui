import gql from 'graphql-tag'

import { accountFragment } from 'lib/fragments/accountFragment'

export const accountQuery = (number) => {
  const blockFilter = number > 0 ? `, block: { number: ${number} }` : ''

  return gql`
    query accountQuery($accountAddress: String!) {
      account(id: $accountAddress ${blockFilter}) {
        ...accountFragment
      },
    }
    ${accountFragment}
  `
}
