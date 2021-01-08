import gql from 'graphql-tag'

// this looks the same as singleRandomWinnerFragment but due to the way Apollo caches and the way
// graphql works, this is unique from singleRandomWinnerFragment
export const timeTravelSingleRandomWinnerFragment = gql`
  fragment timeTravelSingleRandomWinnerFragment on SingleRandomWinner {
    id

    ticket {
      id
      totalSupply
    }
    sponsorship {
      id
      totalSupply
    }

    prizePeriodSeconds
  }
`
