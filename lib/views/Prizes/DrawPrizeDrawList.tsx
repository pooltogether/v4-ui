import { Card } from '@pooltogether/react-components'
import { DrawPrize, PrizePool } from '@pooltogether/v4-js-client'
import { ConnectWalletButton } from 'lib/components/ConnectWalletButton'
import { PagePadding } from 'lib/components/Layout/PagePadding'
import { useUnclaimedDraws } from 'lib/hooks/Tsunami/DrawPrizes/useUnclaimedDraws'
import { useUsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { useNextDrawDate } from 'lib/hooks/Tsunami/useNextDrawDate'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { getPrettyDate } from 'lib/utils/getNextDrawDate'
import React, { useMemo, useState } from 'react'
import { DrawCard } from './DrawCard'
import { DrawCarousel } from './DrawCarousel'

interface DrawPrizeDrawListProps {
  drawPrize: DrawPrize
  prizePool: PrizePool
}

export const DrawPrizeDrawList = (props: DrawPrizeDrawListProps) => {
  const { drawPrize, prizePool } = props
  const { data: draws, isFetched } = useUnclaimedDraws(drawPrize)
  const { refetch: refetchUsersBalances } = useUsersPrizePoolBalances(prizePool)
  const usersAddress = useUsersAddress()
  const [drawIdsToHideThisSession, setDrawIdsToHideThisSession] = useState([])
  const nextDrawDate = useNextDrawDate()

  const drawsToRender = useMemo(
    () => draws?.filter((draw) => !drawIdsToHideThisSession.includes(draw.drawId)),
    [draws, drawIdsToHideThisSession]
  )

  if (!usersAddress) {
    return (
      <PagePadding>
        <Card className='flex flex-col space-y-4 text-center'>
          <span>Connect a wallet to check for prizes!</span>
          <span>Next draw is {getPrettyDate(nextDrawDate)}</span>
          <ConnectWalletButton />
        </Card>
      </PagePadding>
    )
  }

  if (!isFetched)
    return (
      <PagePadding>
        <LoadingCard />
      </PagePadding>
    )

  if (isFetched && drawsToRender.length === 0) {
    return (
      <PagePadding>
        <div className='flex flex-col purple-radial-gradient text-center text-accent-1'>
          <span className='mt-10'>Nothing to see here!</span>
          <span className='mb-10'>Come back on {getPrettyDate(nextDrawDate)}</span>
        </div>
      </PagePadding>
    )
  }

  return (
    <div className='pb-20 max-w-5xl mx-auto'>
      <DrawCarousel>
        {drawsToRender.map((draw) => (
          <div
            className='mx-auto pb-12 flex justify-center'
            key={`${drawPrize.id()}_${draw.drawId}`}
          >
            <div className='mx-2 sm:mx-4 max-w-xl '>
              <DrawCard
                drawPrize={drawPrize}
                draw={draw}
                hideDrawCard={() =>
                  setDrawIdsToHideThisSession((drawsToHide) => [...drawsToHide, draw.drawId])
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

const LoadingCard = () => <div className='w-full rounded-xl animate-pulse bg-card h-128' />
