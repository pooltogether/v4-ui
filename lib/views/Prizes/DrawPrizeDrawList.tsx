import { DrawPrize, PrizePool } from '@pooltogether/v4-js-client'
import { PagePadding } from 'lib/components/Layout/PagePadding'
import { useUnclaimedDrawsAndPrizeDistributions } from 'lib/hooks/Tsunami/DrawPrizes/useUnclaimedDrawsAndPrizeDistributions'
import { useUsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { useNextDrawDate } from 'lib/hooks/Tsunami/useNextDrawDate'
import { getPrettyDate } from 'lib/utils/date'
import React, { useMemo, useState } from 'react'
import { DrawCard } from './DrawCard'
import { DrawCarousel } from './DrawCarousel'

interface DrawPrizeDrawListProps {
  drawPrize: DrawPrize
  prizePool: PrizePool
}

export const DrawPrizeDrawList = (props: DrawPrizeDrawListProps) => {
  const { drawPrize, prizePool } = props
  const {
    error,
    data: drawsAndPrizeDistributions,
    isFetched
  } = useUnclaimedDrawsAndPrizeDistributions(drawPrize)
  const { refetch: refetchUsersBalances } = useUsersPrizePoolBalances(prizePool)
  const [drawIdsToHideThisSession, setDrawIdsToHideThisSession] = useState([])
  const nextDrawDate = useNextDrawDate()

  if (error) {
    return <div>error</div>
  }
  // Filter out manually hidden draw ids from this session
  const drawsAndPrizeDistributionsToRender = useMemo(
    () =>
      drawsAndPrizeDistributions?.filter(
        (drawAndPrizeDistribution) =>
          !drawIdsToHideThisSession.includes(drawAndPrizeDistribution.draw.drawId)
      ),
    [drawsAndPrizeDistributions, drawIdsToHideThisSession]
  )

  if (!isFetched) {
    return <LoadingCard />
  }

  if (isFetched && drawsAndPrizeDistributionsToRender.length === 0) {
    return (
      <div className='flex flex-col purple-radial-gradient text-center text-accent-1 mx-auto px-2 max-w-xl mb-12'>
        <span className='mt-10'>No draws left to check!</span>
        <span className='mb-10'>Come back on {getPrettyDate(nextDrawDate)}</span>
      </div>
    )
  }

  return (
    <div className='max-w-5xl mx-auto'>
      <DrawCarousel>
        {drawsAndPrizeDistributionsToRender.map((drawAndPrizeDistribution) => (
          <div
            className='mx-auto pb-12 flex justify-center'
            key={`${drawPrize.id()}_${drawAndPrizeDistribution.draw.drawId}`}
          >
            <div className='mx-2 sm:mx-4 max-w-xl '>
              <DrawCard
                drawPrize={drawPrize}
                draw={drawAndPrizeDistribution.draw}
                prizeDistribution={drawAndPrizeDistribution.prizeDistribution}
                hideDrawCard={() =>
                  setDrawIdsToHideThisSession((drawsToHide) => [
                    ...drawsToHide,
                    drawAndPrizeDistribution.draw.drawId
                  ])
                }
                refetchUsersBalances={refetchUsersBalances}
              />
            </div>
          </div>
        ))}
      </DrawCarousel>
    </div>
  )
}

const LoadingCard = (props) => (
  <div className='w-full max-w-xl px-2 mb-12 mx-auto'>
    <div className='w-full rounded-xl animate-pulse bg-card h-128 mx-auto' />
  </div>
)
