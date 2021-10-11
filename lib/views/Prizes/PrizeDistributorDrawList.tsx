import React, { useMemo, useState } from 'react'
import { PrizeDistributor, PrizePool } from '@pooltogether/v4-js-client'
import { useTranslation } from 'react-i18next'

import { useUnclaimedDrawsAndPrizeDistributions } from 'lib/hooks/Tsunami/PrizeDistributor/useUnclaimedDrawsAndPrizeDistributions'
import { useUsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { useNextDrawDate } from 'lib/hooks/Tsunami/useNextDrawDate'
import { getPrettyDate } from 'lib/utils/date'
import { DrawCard } from './DrawCard'
import { DrawCarousel } from './DrawCarousel'

interface PrizeDistributorDrawListProps {
  prizeDistributor: PrizeDistributor
  prizePool: PrizePool
}

export const PrizeDistributorDrawList = (props: PrizeDistributorDrawListProps) => {
  const { prizeDistributor, prizePool } = props
  const { t } = useTranslation()
  const {
    error,
    data: drawsAndPrizeDistributions,
    isFetched
  } = useUnclaimedDrawsAndPrizeDistributions(prizeDistributor)
  const { refetch: refetchUsersBalances } = useUsersPrizePoolBalances(prizePool)
  const [drawIdsToHideThisSession, setDrawIdsToHideThisSession] = useState([])
  const nextDrawDate = useNextDrawDate()

  // Filter out manually hidden draw ids from this session
  const drawsAndPrizeDistributionsToRender = useMemo(
    () =>
      drawsAndPrizeDistributions?.filter(
        (drawAndPrizeDistribution) =>
          !drawIdsToHideThisSession.includes(drawAndPrizeDistribution.draw.drawId)
      ) || [],
    [drawsAndPrizeDistributions, drawIdsToHideThisSession]
  )

  if (!isFetched) {
    return <LoadingCard />
  }

  if (isFetched && drawsAndPrizeDistributionsToRender.length === 0) {
    return (
      <div className='flex flex-col justify-center purple-radial-gradient text-center text-accent-1 mx-auto px-2 max-w-xl mb-4 h-48 xs:h-112'>
        <span className='mt-10 text-xl text-white'>
          {t('noDrawsToCheck', 'No draws to check!')}
        </span>
        <span className='mb-10'>
          {t('comeBackOnDate', 'Come back on {{date}}', {
            date: getPrettyDate(nextDrawDate)
          })}
        </span>
      </div>
    )
  }

  return (
    <div className='max-w-5xl mx-auto'>
      <DrawCarousel>
        {drawsAndPrizeDistributionsToRender.map((drawAndPrizeDistribution) => (
          <div
            className='mx-auto pb-12 flex justify-center'
            key={`${prizeDistributor.id()}_${drawAndPrizeDistribution.draw.drawId}`}
          >
            <div className='draw-card-container max-w-xl px-2'>
              <DrawCard
                prizeDistributor={prizeDistributor}
                draw={drawAndPrizeDistribution.draw}
                timelock={drawAndPrizeDistribution.timelock}
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
    <div className='w-full rounded-xl animate-pulse bg-card mb-4 h-48 xs:h-112 mx-auto' />
  </div>
)
