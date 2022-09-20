import { useHasUserCheckedAllDraws } from '@hooks/v4/PrizeDistributor/useHasUserCheckedAllDraws'
import { useUsersUnclaimedWinningDrawResults } from '@hooks/v4/PrizeDistributor/useUnclaimedWInningDrawResults'
import { useUsersUnclaimedDrawDatas } from '@hooks/v4/PrizeDistributor/useUsersUnclaimedDrawDatas'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { Token } from '@pooltogether/hooks'
import {
  Card,
  SquareLink,
  SquareButton,
  SquareButtonTheme,
  SquareButtonSize,
  ThemedClipSpinner
} from '@pooltogether/react-components'
import { PrizeDistributor, DrawResults, PrizePool } from '@pooltogether/v4-client-js'
import {
  formatBlockExplorerTxUrl,
  Transaction,
  TransactionState,
  TransactionStatus,
  useTransaction,
  useUsersAddress
} from '@pooltogether/wallet-connection'
import { drawIdsToNotClaimAtom, drawResultsAtom } from '@utils/drawResultsStorage'
import { getUsersDrawResults } from '@utils/getUsersDrawResults'
import axios from 'axios'
import { useAtom } from 'jotai'
import { useTranslation } from 'next-i18next'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { DrawData } from '../../../interfaces/v4'
import { LoadingCard } from './LoadingCard'
import { LockedDrawsCard } from './LockedDrawsCard'
import { MultipleDrawDetails } from './MultipleDrawDetails'
import { PrizeAnimationCard } from './PrizeAnimationCard'
import { PrizeClaimSheet } from './PrizeClaimSheet'
import { VideoClip } from './PrizeVideoBackground'

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
  const hasUserCheckedAllDraws = hasUserCheckedAllDrawsData.hasUserCheckedAllDraws

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
    <MultiDrawsClaimSection
      {...props}
      drawDatas={drawDatas}
      token={prizePoolTokens.token}
      ticket={prizePoolTokens.ticket}
    />
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
  const [targetVideoClip, setTargetVideoClip] = useState<VideoClip>(VideoClip.rest)
  const [checkedState, setCheckedState] = useState<CheckedState>(CheckedState.unchecked)
  const [winningDrawResults, setWinningDrawResults] = useState<{ [drawId: number]: DrawResults }>(
    null
  )
  const [drawIdsToNotClaim, setDrawIdsToNotClaim] = useAtom(drawIdsToNotClaimAtom)
  const didUserWinAPrize = Boolean(winningDrawResults)
    ? Object.keys(winningDrawResults).length > 0
    : undefined
  const [hasCheckedAnimationFinished, setHasCheckedAnimationFinished] = useState<boolean>(false)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const [txId, setTxId] = useState('')
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

  useEffect(() => {
    if (checkedState === CheckedState.checking) {
      setTargetVideoClip(VideoClip.reveal)
    } else if (checkedState === CheckedState.checked) {
      if (!!didUserWinAPrize) {
        setTargetVideoClip(VideoClip.prize)
      } else if (!didUserWinAPrize) {
        setTargetVideoClip(VideoClip.noPrize)
      }
    }
  }, [checkedState, didUserWinAPrize])

  const onTargetReached = useCallback(() => {
    console.log('onTargetReached', targetVideoClip)
    if (targetVideoClip === VideoClip.prize || targetVideoClip === VideoClip.noPrize) {
      setHasCheckedAnimationFinished(true)
    }
  }, [targetVideoClip])

  return (
    <PrizeAnimationCard targetVideoClip={targetVideoClip} onTargetReached={onTargetReached}>
      <MultipleDrawDetails drawDatas={drawDatas} token={token} ticket={ticket} />
      <div className='flex flex-col justify-end h-full xs:justify-start xs:max-w-min xs:-mt-4'>
        <MultiDrawsClaimButton
          {...props}
          hasCheckedAnimationFinished={hasCheckedAnimationFinished}
          didUserWinAPrize={didUserWinAPrize}
          setWinningDrawResults={setWinningDrawResults}
          checkedState={checkedState}
          setCheckedState={setCheckedState}
          openModal={() => setIsModalOpen(true)}
          claimTx={claimTx}
          className='flex items-center text-center mx-auto xs:mx-0 w-full sm:w-auto'
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
    </PrizeAnimationCard>
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
    // Use draw ids from drawDatas as source of truth for expired and locked draws
    const drawIds = Object.keys(drawDatas).map(Number)
    const winningDrawData: { [drawId: number]: DrawData } = {}
    drawIds.forEach((drawId) => {
      const drawResult = winningDrawResults[drawId]
      if (drawResult) {
        winningDrawData[drawId] = drawDatas[drawId]
      }
    })
    return winningDrawData
  }, [winningDrawResults, drawDatas])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [txId, setTxId] = useState('')
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
    <PrizeAnimationCard targetVideoClip={VideoClip.prize}>
      <MultipleDrawDetails drawDatas={winningDrawData} token={token} ticket={ticket} />
      <div className='flex flex-col justify-end h-full xs:justify-start xs:max-w-min xs:-mt-4'>
        <SquareButton
          theme={SquareButtonTheme.rainbow}
          size={SquareButtonSize.md}
          onClick={() => setIsModalOpen(true)}
          className='flex items-center text-center mx-auto xs:mx-0 w-full sm:w-auto'
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
    </PrizeAnimationCard>
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

  if (claimTx?.response?.hash) {
    url = formatBlockExplorerTxUrl(claimTx.response.hash, claimTx.chainId)
  }

  const sendCheckForPrizesToWorkerKV = () => {
    axios.get(`https://check-for-prizes.pooltogether-api.workers.dev/check?address=${usersAddress}`)
  }

  if (claimTx?.state === TransactionState.pending) {
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
  } else if (claimTx?.status === TransactionStatus.success) {
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
        <span className='w-max'>{t('viewPrizes', 'View prizes')}</span>
      </SquareButton>
    )
  } else if (
    checkedState === CheckedState.checked &&
    !didUserWinAPrize &&
    hasCheckedAnimationFinished
  ) {
    btnJsx = (
      <SquareButton size={size} disabled className={className}>
        <span className='w-max'>{t('noPrizesToClaim', 'No prizes to claim')}</span>
      </SquareButton>
    )
  } else {
    const isChecking = checkedState !== CheckedState.unchecked
    btnJsx = (
      <SquareButton
        size={size}
        onClick={() => {
          getUsersDrawResults(
            prizeDistributor,
            drawDataList,
            usersAddress,
            setWinningDrawResults,
            setCheckedState,
            setStoredDrawResults
          )
          sendCheckForPrizesToWorkerKV()
        }}
        disabled={isChecking}
        className={className}
        style={{ minWidth: 230 }}
      >
        {isChecking ? (
          <>
            <ThemedClipSpinner size={12} className='mr-2' />
            <span className='w-max'>{t('checkingForPrizes', 'Checking for prizes')}</span>
          </>
        ) : (
          <span className='w-max'>{t('checkForPrizes', 'Check for prizes')}</span>
        )}
      </SquareButton>
    )
  }

  return <div className='flex items-center relative'>{btnJsx}</div>
}

MultiDrawsClaimButton.defaultProps = {
  size: SquareButtonSize.md
}
