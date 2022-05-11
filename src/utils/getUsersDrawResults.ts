import { DrawData } from '@interfaces/v4'
import { DrawResults, PrizeApi, PrizeDistributor } from '@pooltogether/v4-client-js'
import { CheckedState } from '@views/Prizes/MultiDrawsCard'
import { getStoredDrawResults, StoredDrawResults, updateDrawResults } from './drawResultsStorage'

export const getUsersDrawResults = async (
  prizeDistributor: PrizeDistributor,
  drawDataList: DrawData[],
  usersAddress: string,
  ticketAddress: string,
  setWinningDrawResults: (drawResults: { [drawId: number]: DrawResults }) => void,
  setCheckedState: (state: CheckedState) => void,
  setStoredDrawResults: (storedDrawResults: StoredDrawResults) => void
) => {
  setCheckedState(CheckedState.checking)
  // Read stored draw results
  const storedDrawResults = getStoredDrawResults(usersAddress, prizeDistributor, ticketAddress)

  const winningDrawResults: { [drawId: string]: DrawResults } = {}
  const newDrawResults: { [drawId: string]: DrawResults } = {}

  const drawResultsPromises = drawDataList.map(async (drawData, index) => {
    const { prizeTier, draw } = drawData
    let drawResults: DrawResults
    const storedDrawResult = storedDrawResults[draw.drawId]
    if (storedDrawResult) {
      drawResults = storedDrawResult
    } else {
      try {
        // TODO: Switch back to remote prize fetching
        // drawResults = await prizeDistributor.getUsersDrawResultsForDrawId(
        //   usersAddress,
        //   ticketAddress,
        //   draw.drawId,
        //   prizeTier.maxPicksPerUser
        // )
        drawResults = await PrizeApi.computeDrawResults(
          prizeDistributor.chainId,
          usersAddress,
          ticketAddress,
          prizeDistributor.address,
          draw.drawId
        )
        console.log('Local results', { drawResults })
        // Store draw result
      } catch (e) {
        console.log('Falling back to local computation | ', e.message)
        drawResults = await PrizeApi.computeDrawResults(
          prizeDistributor.chainId,
          usersAddress,
          ticketAddress,
          prizeDistributor.address,
          draw.drawId
        )
        console.log({ drawResults })
      }
      newDrawResults[draw.drawId] = drawResults
    }
    if (!drawResults.totalValue.isZero()) {
      winningDrawResults[draw.drawId] = drawResults
    }
  })

  await Promise.all(drawResultsPromises)

  updateDrawResults(
    usersAddress,
    prizeDistributor,
    ticketAddress,
    newDrawResults,
    setStoredDrawResults
  )
  setWinningDrawResults(winningDrawResults)
  setCheckedState(CheckedState.checked)
}
