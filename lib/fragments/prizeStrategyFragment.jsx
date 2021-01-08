import gql from 'graphql-tag'

import { multipleWinnersFragment } from 'lib/fragments/multipleWinnersFragment'
import { singleRandomWinnerFragment } from 'lib/fragments/singleRandomWinnerFragment'

export const prizeStrategyFragment = gql`
  fragment prizeStrategyFragment on PrizeStrategy {
    id

    singleRandomWinner {
      ...singleRandomWinnerFragment
    }
    multipleWinners {
      ...multipleWinnersFragment
    }
  }
  ${singleRandomWinnerFragment}
  ${multipleWinnersFragment}
`
