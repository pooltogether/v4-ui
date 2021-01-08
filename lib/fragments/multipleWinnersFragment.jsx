import gql from 'graphql-tag'

import { controlledTokenFragment } from 'lib/fragments/controlledTokenFragment'
import { multipleWinnersExternalErc20AwardFragment } from 'lib/fragments/multipleWinnersExternalErc20AwardFragment'
import { multipleWinnersExternalErc721AwardFragment } from 'lib/fragments/multipleWinnersExternalErc721AwardFragment'

export const multipleWinnersFragment = gql`
  fragment multipleWinnersFragment on MultipleWinnersPrizeStrategy {
    id

    numberOfWinners
    prizePeriodSeconds

    ticket {
      ...controlledTokenFragment
    }
    sponsorship {
      ...controlledTokenFragment
    }
    externalErc20Awards {
      ...multipleWinnersExternalErc20AwardFragment
    }
    externalErc721Awards {
      ...multipleWinnersExternalErc721AwardFragment
    }
  }
  ${controlledTokenFragment}
  ${multipleWinnersExternalErc20AwardFragment}
  ${multipleWinnersExternalErc721AwardFragment}
`
