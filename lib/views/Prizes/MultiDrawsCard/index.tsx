import React, { useMemo, useRef, useState } from 'react'
import { Token, Transaction, useTransaction } from '@pooltogether/hooks'
import {
  formatBlockExplorerTxUrl,
  Card,
  SquareLink,
  SquareButton,
  SquareButtonTheme,
  SquareButtonSize,
  ThemedClipSpinner
} from '@pooltogether/react-components'
import { PrizeDistributor, Draw, DrawResults, PrizePool } from '@pooltogether/v4-js-client'
import { useTranslation } from 'react-i18next'
import { deserializeBigNumbers } from '@pooltogether/utilities'

import { usePrizePoolTokens } from 'lib/hooks/v4/PrizePool/usePrizePoolTokens'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { PrizeClaimSheet } from './PrizeClaimSheet'
import { DrawData } from 'lib/types/v4'
import { PrizeVideoBackground } from './PrizeVideoBackground'
import { LockedDrawsCard } from './LockedDrawsCard'
import { LoadingCard } from './LoadingCard'
import { useUsersUnclaimedDrawDatas } from 'lib/hooks/v4/PrizeDistributor/useUsersUnclaimedDrawDatas'
import { MultipleDrawDetails } from './MultipleDrawDetails'
import {
  drawIdsToNotClaimAtom,
  drawResultsAtom,
  getStoredDrawResults,
  StoredDrawResults,
  updateDrawResults
} from 'lib/utils/drawResultsStorage'
import { useAtom } from 'jotai'
import { useHasUserCheckedAllDraws } from 'lib/hooks/v4/PrizeDistributor/useHasUserCheckedAllDraws'
import { StaticPrizeVideoBackground, VideoClip } from './StaticPrizeVideoBackground'
import { useUsersUnclaimedWinningDrawResults } from 'lib/hooks/v4/PrizeDistributor/useUnclaimedWInningDrawResults'

interface MultiDrawsCardProps {
  prizeDistributor: PrizeDistributor
  prizePool: PrizePool
}

export interface MultiDrawsCardPropsWithDetails extends MultiDrawsCardProps {
  drawDatas: { [drawId: number]: DrawData }
  token: Token
  ticket: Token
}

export const MultiDrawsCard = (props: MultiDrawsCardProps) => {
  const { prizePool, prizeDistributor } = props
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)
  const usersAddress = useUsersAddress()
  const { data: unclaimedDrawDatasData, isFetched: isUnclaimedDrawDataFetched } =
    useUsersUnclaimedDrawDatas(usersAddress, prizeDistributor)
  const { data: hasUserCheckedAllDrawsData, isFetched: isHasUserCheckedAllDrawsFetched } =
    useHasUserCheckedAllDraws(usersAddress, prizeDistributor)

  if (
    !isPrizePoolTokensFetched ||
    !isUnclaimedDrawDataFetched ||
    !isHasUserCheckedAllDrawsFetched
  ) {
    return <LoadingCard />
  }

  const drawDatas = unclaimedDrawDatasData[usersAddress]
  const hasUserCheckedAllDraws = hasUserCheckedAllDrawsData[usersAddress]

  if (Boolean(drawDatas) && Object.keys(drawDatas).length === 0) {
    return (
      <LockedDrawsCard
        prizeDistributor={prizeDistributor}
        token={prizePoolTokens.token}
        ticket={prizePoolTokens.ticket}
      />
    )
  }

  if (hasUserCheckedAllDraws) {
    return (
      <CheckedDrawsClaimCard
        {...props}
        drawDatas={drawDatas}
        token={prizePoolTokens.token}
        ticket={prizePoolTokens.ticket}
      />
    )
  }

  return (
    <div>
      <Card className='draw-card' paddingClassName=''>
        <MultiDrawsClaimSection
          {...props}
          drawDatas={drawDatas}
          token={prizePoolTokens.token}
          ticket={prizePoolTokens.ticket}
        />
      </Card>
    </div>
  )
}

//////////////////// Draw claim ////////////////////

// TODO: set claim section state should push into the animation queue with a callback, that then executes the claim section change
export enum CheckedState {
  unchecked,
  checking,
  checked
}

const MultiDrawsClaimSection = (props: MultiDrawsCardPropsWithDetails) => {
  const { drawDatas, ticket, token } = props
  const [checkedState, setCheckedState] = useState<CheckedState>(CheckedState.unchecked)
  const [winningDrawResults, setWinningDrawResults] =
    useState<{ [drawId: number]: DrawResults }>(null)
  const [drawIdsToNotClaim, setDrawIdsToNotClaim] = useAtom(drawIdsToNotClaimAtom)
  const didUserWinAPrize = Boolean(winningDrawResults)
    ? Object.keys(winningDrawResults).length > 0
    : undefined
  const [hasCheckedAnimationFinished, setHasCheckedAnimationFinished] = useState<boolean>(false)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const [txId, setTxId] = useState(0)
  const claimTx = useTransaction(txId)

  const addDrawIdToClaim = (drawId: number) => {
    setDrawIdsToNotClaim((drawIdsToNotClaim) => {
      const newDrawIdsToClaim = new Set(drawIdsToNotClaim)
      newDrawIdsToClaim.add(drawId)
      return newDrawIdsToClaim
    })
  }

  const removeDrawIdToClaim = (drawId: number) => {
    setDrawIdsToNotClaim((drawIdsToNotClaim) => {
      const newDrawIdsToClaim = new Set(drawIdsToNotClaim)
      newDrawIdsToClaim.delete(drawId)
      return newDrawIdsToClaim
    })
  }

  return (
    <>
      <PrizeVideoBackground
        didUserWinAPrize={didUserWinAPrize}
        setCheckedAnimationFinished={() => setHasCheckedAnimationFinished(true)}
        checkedState={checkedState}
        className='absolute inset-0'
      />
      <MultipleDrawDetails
        drawDatas={drawDatas}
        token={token}
        ticket={ticket}
        className='absolute top-4 xs:top-8 left-0 px-4 xs:px-8'
      />
      <div className='absolute bottom-4 left-0 right-0 xs:top-14 xs:bottom-auto xs:left-auto xs:right-auto px-4 xs:px-8'>
        <MultiDrawsClaimButton
          {...props}
          hasCheckedAnimationFinished={hasCheckedAnimationFinished}
          didUserWinAPrize={didUserWinAPrize}
          setWinningDrawResults={setWinningDrawResults}
          checkedState={checkedState}
          setCheckedState={setCheckedState}
          openModal={() => setIsModalOpen(true)}
          claimTx={claimTx}
          className='text-center mx-auto xs:mx-0 w-full sm:w-auto'
        />
      </div>
      <PrizeClaimSheet
        {...props}
        setTxId={setTxId}
        claimTx={claimTx}
        drawIdsToNotClaim={drawIdsToNotClaim}
        addDrawIdToClaim={addDrawIdToClaim}
        removeDrawIdToClaim={removeDrawIdToClaim}
        winningDrawResults={winningDrawResults}
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
      />
    </>
  )
}

interface MultiDrawsClaimButtonProps extends MultiDrawsCardPropsWithDetails {
  hasCheckedAnimationFinished: boolean
  checkedState: CheckedState
  didUserWinAPrize: boolean
  claimTx: Transaction
  className?: string
  size?: SquareButtonSize
  setWinningDrawResults: (drawResultsList: { [drawId: number]: DrawResults }) => void
  setCheckedState: (state: CheckedState) => void
  openModal: () => void
}

// NOTE: Shortcut. Just copy pasta for now.
const CheckedDrawsClaimCard = (props: MultiDrawsCardPropsWithDetails) => {
  const { drawDatas, prizeDistributor, ticket, token } = props
  const { t } = useTranslation()

  const usersAddress = useUsersAddress()
  const [drawIdsToNotClaim, setDrawIdsToNotClaim] = useAtom(drawIdsToNotClaimAtom)
  const { data: winningDrawResultsData, isFetched: isUsersUnclaimedWinningDrawResultsFetched } =
    useUsersUnclaimedWinningDrawResults(usersAddress, prizeDistributor)

  const winningDrawResults = winningDrawResultsData?.[usersAddress]

  const winningDrawData = useMemo(() => {
    if (!winningDrawResults) {
      return null
    }
    const drawIds = Object.keys(winningDrawResults).map(Number)
    const winningDrawData: { [drawId: number]: DrawData } = {}
    drawIds.forEach((drawId) => {
      winningDrawData[drawId] = drawDatas[drawId]
    })
    return winningDrawData
  }, [winningDrawResults, drawDatas])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [txId, setTxId] = useState(0)
  const claimTx = useTransaction(txId)

  const addDrawIdToClaim = (drawId: number) => {
    setDrawIdsToNotClaim((drawIdsToNotClaim) => {
      const newDrawIdsToClaim = new Set(drawIdsToNotClaim)
      newDrawIdsToClaim.add(drawId)
      return newDrawIdsToClaim
    })
  }

  const removeDrawIdToClaim = (drawId: number) => {
    setDrawIdsToNotClaim((drawIdsToNotClaim) => {
      const newDrawIdsToClaim = new Set(drawIdsToNotClaim)
      newDrawIdsToClaim.delete(drawId)
      return newDrawIdsToClaim
    })
  }

  if (!isUsersUnclaimedWinningDrawResultsFetched) {
    return null
  }

  if (!winningDrawResults || Object.keys(winningDrawResults).length === 0) {
    return <LockedDrawsCard prizeDistributor={prizeDistributor} token={token} ticket={ticket} />
  }

  return (
    <Card className='draw-card' paddingClassName=''>
      <StaticPrizeVideoBackground videoClip={VideoClip.prize} className='absolute inset-0' />
      <MultipleDrawDetails
        drawDatas={winningDrawData}
        token={token}
        ticket={ticket}
        className='absolute top-4 xs:top-8 left-0 px-4 xs:px-8'
      />
      <div className='absolute bottom-4 left-0 right-0 xs:top-14 xs:bottom-auto xs:left-auto xs:right-auto px-4 xs:px-8'>
        <SquareButton
          theme={SquareButtonTheme.rainbow}
          size={SquareButtonSize.md}
          onClick={() => setIsModalOpen(true)}
          className='text-center mx-auto xs:mx-0 w-full sm:w-auto'
          style={{ minWidth: 230 }}
        >
          {t('viewPrizes', 'View prizes')}
        </SquareButton>
      </div>
      <PrizeClaimSheet
        {...props}
        setTxId={setTxId}
        claimTx={claimTx}
        drawIdsToNotClaim={drawIdsToNotClaim}
        addDrawIdToClaim={addDrawIdToClaim}
        removeDrawIdToClaim={removeDrawIdToClaim}
        winningDrawResults={winningDrawResults}
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
      />
    </Card>
  )
}

const MultiDrawsClaimButton = (props: MultiDrawsClaimButtonProps) => {
  const {
    checkedState,
    claimTx,
    didUserWinAPrize,
    prizeDistributor,
    drawDatas,
    className,
    size,
    hasCheckedAnimationFinished,
    setWinningDrawResults,
    setCheckedState,
    openModal
  } = props
  const usersAddress = useUsersAddress()
  const { t } = useTranslation()
  const [storedDrawResults, setStoredDrawResults] = useAtom(drawResultsAtom)

  let btnJsx, url
  const drawDataList = drawDatas ? Object.values(drawDatas) : []
  const draws = drawDataList.map((drawData) => drawData.draw)

  if (claimTx?.hash) {
    url = formatBlockExplorerTxUrl(claimTx.hash, claimTx.ethersTx.chainId)
  }

  if (claimTx?.inFlight) {
    btnJsx = (
      <SquareLink
        target='_blank'
        href={url}
        theme={SquareButtonTheme.teal}
        size={size}
        className={className}
      >
        <ThemedClipSpinner className='mr-2' size={12} />
        {t('claiming', 'Claiming')}
      </SquareLink>
    )
  } else if (claimTx?.completed && !claimTx?.error && !claimTx?.cancelled) {
    btnJsx = (
      <SquareLink
        target='_blank'
        href={url}
        theme={SquareButtonTheme.tealOutline}
        size={size}
        className={className}
      >
        {t('viewReceipt', 'View receipt')}
      </SquareLink>
    )
  } else if (
    checkedState === CheckedState.checked &&
    didUserWinAPrize &&
    hasCheckedAnimationFinished
  ) {
    btnJsx = (
      <SquareButton
        theme={SquareButtonTheme.rainbow}
        size={size}
        onClick={() => openModal()}
        className={className}
        style={{ minWidth: 230 }}
      >
        {t('viewPrizes', 'View prizes')}
      </SquareButton>
    )
  } else if (
    checkedState === CheckedState.checked &&
    !didUserWinAPrize &&
    hasCheckedAnimationFinished
  ) {
    btnJsx = (
      <SquareButton size={size} disabled className={className}>
        {t('noPrizesToClaim', 'No prizes to claim')}
      </SquareButton>
    )
  } else {
    const isChecking = checkedState !== CheckedState.unchecked
    btnJsx = (
      <SquareButton
        size={size}
        onClick={() =>
          getUsersDrawResults(
            prizeDistributor,
            draws,
            usersAddress,
            setWinningDrawResults,
            setCheckedState,
            setStoredDrawResults
          )
        }
        disabled={isChecking}
        className={className}
        style={{ minWidth: 230 }}
      >
        {isChecking ? (
          <>
            <ThemedClipSpinner size={12} className='mr-2' />
            {t('checkingForPrizes', 'Checking for prizes')}
          </>
        ) : (
          t('checkForPrizes', 'Check for prizes')
        )}
      </SquareButton>
    )
  }

  return <div className='flex items-center relative'>{btnJsx}</div>
}

MultiDrawsClaimButton.defaultProps = {
  size: SquareButtonSize.md
}

const getUsersDrawResults = async (
  prizeDistributor: PrizeDistributor,
  draws: Draw[],
  usersAddress: string,
  setWinningDrawResults: (drawResults: { [drawId: number]: DrawResults }) => void,
  setCheckedState: (state: CheckedState) => void,
  setStoredDrawResults: (storedDrawResults: StoredDrawResults) => void
) => {
  setCheckedState(CheckedState.checking)
  // Read stored draw results
  const storedDrawResults = getStoredDrawResults(usersAddress, prizeDistributor)

  const winningDrawResults: { [drawId: string]: DrawResults } = {}
  const newDrawResults: { [drawId: string]: DrawResults } = {}

  const drawResultsPromises = draws.map(async (draw) => {
    let drawResults: DrawResults
    const storedDrawResult = storedDrawResults[draw.drawId]
    if (storedDrawResult) {
      drawResults = storedDrawResult
    } else {
      try {
        const url = getDrawCalcUrl(
          prizeDistributor.chainId,
          prizeDistributor.address,
          usersAddress,
          draw.drawId
        )
        const response = await fetch(url)
        const drawResultsJson = await response.json()
        drawResults = deserializeBigNumbers(drawResultsJson)
        // Store draw result
      } catch (e) {
        console.log(e.message)
        drawResults = await prizeDistributor.calculateUsersPrizes(usersAddress, draw)
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

const getDrawCalcUrl = (
  chainId: number,
  prizeDistributorAddress: string,
  usersAddress: string,
  drawId: number
) =>
  `https://tsunami-prizes-production.pooltogether-api.workers.dev/${chainId}/${prizeDistributorAddress}/prizes/${usersAddress}/${drawId}/`
