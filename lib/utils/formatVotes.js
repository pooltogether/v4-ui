import { ethers } from 'ethers'
import { numberWithCommas } from 'lib/utils/numberWithCommas'

export function formatVotes(votes) {
  return numberWithCommas(ethers.utils.formatUnits(votes, 18), { precision: 0 })
}

export function calculateVotePercentage(votes, totalVotes) {
  const v = Math.round(Number(ethers.utils.formatUnits(votes, 18)))
  const t = Math.round(Number(ethers.utils.formatUnits(totalVotes, 18)))
  return Math.round((v / t) * 100)
}
