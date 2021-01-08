import gql from 'graphql-tag'

export const awardedControlledTokenFragment = gql`
  fragment awardedControlledTokenFragment on AwardedControlledToken {
    id

    amount
    token
    winner

    prize {
      id
      prizePool {
        underlyingCollateralDecimals
      }
    }
  }
`
