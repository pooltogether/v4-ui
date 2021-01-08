import { PRIZE_STRATEGY_TYPES } from 'lib/constants'

export const marshallPoolData = (poolGraphData, blockNumber = -1) => {
  const prizeStrategy = poolGraphData?.prizeStrategy
  const actualStrategy = prizeStrategy?.singleRandomWinner ?
    prizeStrategy?.singleRandomWinner :
    prizeStrategy?.multipleWinners

  const prizeStrategyType = prizeStrategy?.singleRandomWinner ?
    PRIZE_STRATEGY_TYPES['singleRandomWinner'] :
    PRIZE_STRATEGY_TYPES['multipleWinners']

  const ticketToken = actualStrategy?.ticket
  const sponsorshipToken = actualStrategy?.sponsorship

  const numberOfWinners = actualStrategy?.numberOfWinners

  const prizePeriodSeconds = actualStrategy?.prizePeriodSeconds

  const externalErc20Awards = actualStrategy?.externalErc20Awards
  const externalErc721Awards = actualStrategy?.externalErc721Awards

  const playerCount = ticketToken?.numberOfHolders
  const ticketSupply = ticketToken?.totalSupply

  const totalSponsorship = sponsorshipToken?.totalSupply

  return {
    poolAddress: poolGraphData?.id,
    externalErc20Awards,
    externalErc721Awards,
    numberOfWinners,
    playerCount,
    prizeStrategyType,
    prizePeriodSeconds,
    sponsorshipToken,
    ticketSupply,
    ticketToken,
    totalSponsorship,
    ticket: ticketToken, // TODO: remove this, use ticketToken instead
    sponsorship: sponsorshipToken, // TODO: remove this, use sponsorshipToken instead
    blockNumber
  }
}
