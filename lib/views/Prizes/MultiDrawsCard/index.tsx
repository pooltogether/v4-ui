import React, { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
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

import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { PrizeClaimModal } from '../PrizeClaimModal'
import { DrawData } from 'lib/types/v4'
import { PrizeVideoBackground } from './PrizeVideo/PrizeVideoBackground'
import { LockedDrawsCard } from './LockedDrawsCard'
import { LoadingCard } from './LoadingCard'
import { useUnclaimedDrawDatas } from 'lib/hooks/Tsunami/PrizeDistributor/useUnclaimedDrawDatas'
import { MultipleDrawDetails } from './MultipleDrawDetails'
import { getStoredDrawResults, setStoredDrawResult } from 'lib/utils/drawResultsStorage'

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

  const { data: drawDatas, isFetched: isUnclaimedDrawDataFetched } =
    useUnclaimedDrawDatas(prizeDistributor)

  if (!isPrizePoolTokensFetched || !isUnclaimedDrawDataFetched) {
    return <LoadingCard />
  }

  // TODO: If there are no draws, attempt to show locked draws
  if (Boolean(drawDatas) && !Object.keys(drawDatas).length) {
    return <LockedDrawsCard prizeDistributor={prizeDistributor} />
  }

  return (
    <Card className='draw-card' paddingClassName=''>
      <MultiDrawsClaimSection
        {...props}
        drawDatas={drawDatas}
        token={prizePoolTokens.token}
        ticket={prizePoolTokens.ticket}
      />
    </Card>
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
  const [winningDrawResultsList, setWinningDrawResultsList] = useState<DrawResults[]>(null)
  const didUserWinAPrize = Boolean(winningDrawResultsList)
    ? winningDrawResultsList.length > 0
    : undefined
  const [hasCheckedAnimationFinished, setHasCheckedAnimationFinished] = useState<boolean>(false)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const [txId, setTxId] = useState(0)
  const claimTx = useTransaction(txId)

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
      {/* <div className='absolute xs:relative mx-auto xs:ml-0 left-0 xs:left-auto right-0 xs:right-auto bottom-2 xs:bottom-auto xs:top-4 text-center'> */}
      <div className='absolute bottom-4 left-0 right-0 xs:top-14 xs:bottom-auto xs:left-auto xs:right-auto px-4 xs:px-8'>
        <MultiDrawsClaimButton
          {...props}
          hasCheckedAnimationFinished={hasCheckedAnimationFinished}
          didUserWinAPrize={didUserWinAPrize}
          setWinningDrawResultsList={setWinningDrawResultsList}
          checkedState={checkedState}
          setCheckedState={setCheckedState}
          openModal={() => setIsModalOpen(true)}
          claimTx={claimTx}
          className='text-center mx-auto xs:mx-0 w-full sm:w-auto'
        />
      </div>
      <PrizeClaimModal
        {...props}
        setTxId={setTxId}
        claimTx={claimTx}
        didUserWinAPrize={didUserWinAPrize}
        winningDrawResultsList={winningDrawResultsList}
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
  setWinningDrawResultsList: (drawResultsList: DrawResults[]) => void
  setCheckedState: (state: CheckedState) => void
  openModal: () => void
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
    setWinningDrawResultsList,
    setCheckedState,
    openModal
  } = props
  const usersAddress = useUsersAddress()
  const { t } = useTranslation()

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
  } else if ([CheckedState.unchecked, CheckedState.checking].includes(checkedState)) {
    const isChecking = checkedState === CheckedState.checking
    btnJsx = (
      <SquareButton
        size={size}
        onClick={() =>
          getUsersDrawResults(
            prizeDistributor,
            draws,
            usersAddress,
            setWinningDrawResultsList,
            setCheckedState
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
  } else if (checkedState === CheckedState.checked && didUserWinAPrize) {
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
  } else {
    btnJsx = (
      <SquareButton size={size} disabled className={className}>
        {t('noPrizesToClaim', 'No prizes to claim')}
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
  setWinningDrawResultsList: (drawResultsList: DrawResults[]) => void,
  setCheckedState: (state: CheckedState) => void
) => {
  setCheckedState(CheckedState.checking)
  const drawIds = draws.map((draw) => draw.drawId)
  // Read stored draw results
  const storedDrawResults = getStoredDrawResults(usersAddress, prizeDistributor, drawIds)

  const winningDrawResultsList: DrawResults[] = []
  const drawResultsPromises = draws.map(async (draw) => {
    let drawResults: DrawResults
    const storedDrawResult = storedDrawResults[draw.drawId]
    if (storedDrawResult) {
      drawResults = storedDrawResult.drawResults
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
        setStoredDrawResult(usersAddress, prizeDistributor, draw.drawId, drawResults)
      } catch (e) {
        console.log(e.message)
        drawResults = await prizeDistributor.getUsersPrizes(usersAddress, draw)
      }
    }
    if (!drawResults.totalValue.isZero()) {
      winningDrawResultsList.push(drawResults)
    }
  })

  await Promise.all(drawResultsPromises)

  setWinningDrawResultsList(winningDrawResultsList)
  setCheckedState(CheckedState.checked)
}

const getDrawCalcUrl = (
  chainId: number,
  prizeDistributorAddress: string,
  usersAddress: string,
  drawId: number
) =>
  `https://tsunami-prizes-production.pooltogether-api.workers.dev/${chainId}/${prizeDistributorAddress}/prizes/${usersAddress}/${drawId}/`
