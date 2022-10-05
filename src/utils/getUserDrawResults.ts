import { DrawData } from '@interfaces/v4'
import { DrawResults, PrizeApi, PrizeDistributor } from '@pooltogether/v4-client-js'
import { CheckedState } from '@views/Prizes/MultiDrawsCard'
import { getStoredDrawResults, StoredDrawResults, updateDrawResults } from './drawResultsStorage'
import { FathomEvent, logEvent } from './services/fathom'

export const getUsersDrawResults = async (
  prizeDistributor: PrizeDistributor,
  drawDataList: DrawData[],
  usersAddress: string,
  setWinningDrawResults: (drawResults: { [drawId: number]: DrawResults }) => void,
  setCheckedState: (state: CheckedState) => void,
  setStoredDrawResults: (storedDrawResults: StoredDrawResults) => void
) => {
  logEvent(FathomEvent.prizeCheck)
  setCheckedState(CheckedState.checking)
  // Read stored draw results
  const storedDrawResults = getStoredDrawResults(usersAddress, prizeDistributor)

  const winningDrawResults: { [drawId: string]: DrawResults } = {}
  const newDrawResults: { [drawId: string]: DrawResults } = {}

  const drawResultsPromises = drawDataList.map(async (drawData, index) => {
    const { prizeDistribution, draw } = drawData
    let drawResults: DrawResults
    const storedDrawResult = storedDrawResults[draw.drawId]
    if (storedDrawResult) {
      drawResults = storedDrawResult
    } else {
      try {
        drawResults = await prizeDistributor.getUsersDrawResultsForDrawId(
          usersAddress,
          draw.drawId,
          prizeDistribution.maxPicksPerUser
        )
        // Store draw result
      } catch (e) {
        console.log(e.message)
        drawResults = await PrizeApi.computeDrawResults(
          prizeDistributor.chainId,
          usersAddress,
          prizeDistributor.address,
          draw.drawId
        )
      }
      newDrawResults[draw.drawId] = drawResults
    }
    if (!drawResults.totalValue.isZero()) {
      winningDrawResults[draw.drawId] = drawResults
    }
  })

  await Promise.all(drawResultsPromises)

  updateDrawResults(usersAddress, prizeDistributor, newDrawResults, setStoredDrawResults)
  setWinningDrawResults(winningDrawResults)
  setCheckedState(CheckedState.checked)
}
