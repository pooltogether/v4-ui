import gql from 'graphql-tag'

import { controlledTokenFragment } from 'lib/fragments/controlledTokenFragment'
import { singleRandomWinnerExternalErc20AwardFragment } from 'lib/fragments/singleRandomWinnerExternalErc20AwardFragment'
import { singleRandomWinnerExternalErc721AwardFragment } from 'lib/fragments/singleRandomWinnerExternalErc721AwardFragment'

export const singleRandomWinnerFragment = gql`
  fragment singleRandomWinnerFragment on SingleRandomWinnerPrizeStrategy {
    id

    prizePeriodSeconds

    ticket {
      ...controlledTokenFragment
    }
    sponsorship {
      ...controlledTokenFragment
    }
    externalErc20Awards {
      ...singleRandomWinnerExternalErc20AwardFragment
    }
    externalErc721Awards {
      ...singleRandomWinnerExternalErc721AwardFragment
    }
  }
  ${controlledTokenFragment}
  ${singleRandomWinnerExternalErc20AwardFragment}
  ${singleRandomWinnerExternalErc721AwardFragment}
`
