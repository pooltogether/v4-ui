import { Card, SquareButton } from '@pooltogether/react-components'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SelectedNetworkToggle } from 'lib/components/SelectedNetworkToggle'
import { useSelectedNetworkDrawPrizes } from 'lib/hooks/Tsunami/DrawPrizes/useSelectedNetworkDrawPrizes'
import { DrawPrize, Draw, PrizePool } from '@pooltogether/v4-js-client'
import { useUnclaimedDraws } from 'lib/hooks/Tsunami/DrawPrizes/useUnclaimedDraws'
import { DrawCard } from './DrawCard'
import { useUsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { DrawCarousel } from './DrawCarousel'
import { getPrettyDate } from 'lib/utils/getNextDrawDate'
import { useNextDrawDate } from 'lib/hooks/Tsunami/useNextDrawDate'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { ConnectWalletButton } from 'lib/components/ConnectWalletButton'
import { PagePadding } from 'lib/components/Layout/PagePadding'

export const PRIZE_UI_STATES = {
  initialState: 'initialState',
  checkingForPrizes: 'checkingForPrizes',
  won: 'won',
  didNotWin: 'didNotWin'
}

// TODO: Note, this is where we are selecting a single DrawPrize from the list
export const PrizesUI = (props) => {
  const { data: drawPrizes, isFetched } = useSelectedNetworkDrawPrizes()
  const { data: prizePool, isFetched: isPrizePoolFetched } = useSelectedNetworkPrizePool()
  if (!isFetched || !isPrizePoolFetched)
    return (
      <PagePadding>
        <LoadingCard />
      </PagePadding>
    )
  return (
    <>
      <SelectedNetworkToggle className='mx-auto mb-8' />
      <DrawPrizeDrawsList drawPrize={drawPrizes[0]} prizePool={prizePool} />
    </>
  )
}

interface DrawPrizeProps {
  drawPrize: DrawPrize
  prizePool: PrizePool
}

export const LoadingCard = () => <div className='w-full rounded-xl animate-pulse bg-card h-128' />

const DrawPrizeDrawsList = (props: DrawPrizeProps) => {
  const { drawPrize, prizePool } = props
  const { data: draws, isFetched } = useUnclaimedDraws(drawPrize)
  const { refetch: refetchUsersBalances } = useUsersPrizePoolBalances(prizePool)
  const usersAddress = useUsersAddress()
  const [drawIdsToHide, setDrawIdsToHide] = useState([])
  const nextDrawDate = useNextDrawDate()

  const drawsToRender = useMemo(
    () => draws?.filter((draw) => !drawIdsToHide.includes(draw.drawId)),
    [draws, drawIdsToHide]
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
        <Card>
          <span>No draws to check!</span>
          <span>Next draw is {getPrettyDate(nextDrawDate)}</span>
        </Card>
      </PagePadding>
    )
  }

  return (
    <div className='pb-20'>
      <DrawCarousel>
        {drawsToRender.map((draw) => (
          <div className='mx-auto pb-12 flex justify-center'>
            <div className='mx-2 sm:mx-4 max-w-xl '>
              <DrawCard
                key={`${drawPrize.id()}_${draw.drawId}`}
                drawPrize={drawPrize}
                draw={draw}
                hideDrawCard={() =>
                  setDrawIdsToHide((drawsToHide) => [...drawsToHide, draw.drawId])
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
