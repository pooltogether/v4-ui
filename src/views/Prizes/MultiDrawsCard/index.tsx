import React, { useMemo, useState } from 'react'
import axios from 'axios'
import { Token } from '@pooltogether/hooks'
import {
  formatBlockExplorerTxUrl,
  Card,
  ButtonLink,
  Button,
  ButtonTheme,
  ButtonSize,
  ThemedClipSpinner
} from '@pooltogether/react-components'
import { PrizeDistributorV2, DrawResults, PrizePool } from '@pooltogether/v4-client-js'
import { useTranslation } from 'react-i18next'

import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import {
  Transaction,
  TransactionState,
  TransactionStatus,
  useTransaction,
  useUsersAddress
} from '@pooltogether/wallet-connection'
import { PrizeClaimSheet } from './PrizeClaimSheet'
import { DrawData } from '../../../interfaces/v4'
import { PrizeVideoBackground } from './PrizeVideoBackground'
import { NoDrawsCard } from './NoDrawsCard'
import { LoadingCard } from './LoadingCard'
import { useUsersUnclaimedDrawDatas } from '@hooks/v4/PrizeDistributor/useUsersUnclaimedDrawDatas'
import { MultipleDrawDetails } from './MultipleDrawDetails'
import { drawIdsToNotClaimAtom, drawResultsAtom } from '@utils/drawResultsStorage'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useHasUserCheckedAllDraws } from '@hooks/v4/PrizeDistributor/useHasUserCheckedAllDraws'
import { StaticPrizeVideoBackground, VideoClip } from './StaticPrizeVideoBackground'
import { useUsersUnclaimedWinningDrawResults } from '@hooks/v4/PrizeDistributor/useUnclaimedWInningDrawResults'
import { getUserDrawResults } from '@utils/getUserDrawResults'
import { useSelectedPrizePoolTicket } from '@hooks/v4/PrizePool/useSelectedPrizePoolTicket'
import { usePrizeDistributorToken } from '@hooks/v4/PrizeDistributor/usePrizeDistributorToken'

interface MultiDrawsCardProps {
  prizeDistributor: PrizeDistributorV2
  prizePool: PrizePool
}

export interface MultiDrawsCardPropsWithDetails extends MultiDrawsCardProps {
  drawDatas: { [drawId: number]: DrawData }
  prizeDistributor: PrizeDistributorV2
  prizeToken: Token
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
  const { data: prizeDistributorTokenData, isFetched: isPrizeTokenFetched } =
    usePrizeDistributorToken(prizeDistributor)

  if (
    !isPrizePoolTokensFetched ||
    !isUnclaimedDrawDataFetched ||
    !isHasUserCheckedAllDrawsFetched ||
    !isPrizeTokenFetched ||
    prizeDistributorTokenData?.prizeDistributorId !== prizeDistributor.id()
  ) {
    return <LoadingCard />
  }

  const drawDatas = unclaimedDrawDatasData[usersAddress]
  const hasUserCheckedAllDraws = hasUserCheckedAllDrawsData.hasUserCheckedAllDraws

  if (Boolean(drawDatas) && Object.keys(drawDatas).length === 0) {
    return <NoDrawsCard />
  }

  if (hasUserCheckedAllDraws) {
    return (
      <CheckedDrawsClaimCard
        {...props}
        drawDatas={drawDatas}
        token={prizePoolTokens.token}
        ticket={prizePoolTokens.ticket}
        prizeToken={prizeDistributorTokenData.token}
      />
    )
  }

  return (
    <div>
      <Card className='draw-card' paddingClassName=''>
        <MultiDrawsClaimSection
          {...props}
          prizeDistributor={prizeDistributor}
          drawDatas={drawDatas}
          token={prizePoolTokens.token}
          ticket={prizePoolTokens.ticket}
          prizeToken={prizeDistributorTokenData.token}
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
  const { drawDatas, prizeToken, prizeDistributor, token } = props
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

  return (
    <>
      <PrizeVideoBackground
        didUserWinAPrize={didUserWinAPrize}
        setCheckedAnimationFinished={() => setHasCheckedAnimationFinished(true)}
        checkedState={checkedState}
        className='absolute inset-0'
      />
      <MultipleDrawDetails
        chainId={prizeDistributor.chainId}
        drawDatas={drawDatas}
        token={token}
        prizeToken={prizeToken}
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
    </>
  )
}

interface MultiDrawsClaimButtonProps extends MultiDrawsCardPropsWithDetails {
  hasCheckedAnimationFinished: boolean
  checkedState: CheckedState
  didUserWinAPrize: boolean
  claimTx: Transaction
  className?: string
  size?: ButtonSize
  setWinningDrawResults: (drawResultsList: { [drawId: number]: DrawResults }) => void
  setCheckedState: (state: CheckedState) => void
  openModal: () => void
}

// NOTE: Shortcut. Just copy pasta for now.
const CheckedDrawsClaimCard = (props: MultiDrawsCardPropsWithDetails) => {
  const { drawDatas, prizeDistributor, prizeToken, token } = props
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
    // Use draw ids from drawDatas as source of truth for expired draws
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
    return <NoDrawsCard />
  }

  return (
    <Card className='draw-card' paddingClassName=''>
      <StaticPrizeVideoBackground videoClip={VideoClip.prize} className='absolute inset-0' />
      <MultipleDrawDetails
        chainId={prizeDistributor.chainId}
        drawDatas={winningDrawData}
        token={token}
        prizeToken={prizeToken}
        className='absolute top-4 xs:top-8 left-0 px-4 xs:px-8'
      />
      <div className='absolute bottom-4 left-0 right-0 xs:top-14 xs:bottom-auto xs:left-auto xs:right-auto px-4 xs:px-8'>
        <Button
          theme={ButtonTheme.rainbow}
          size={ButtonSize.md}
          onClick={() => setIsModalOpen(true)}
          className='mx-auto xs:mx-0 w-full sm:w-auto'
          style={{ minWidth: 230 }}
        >
          {t('viewPrizes', 'View prizes')}
        </Button>
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
  const setStoredDrawResults = useUpdateAtom(drawResultsAtom)
  const { data: ticket } = useSelectedPrizePoolTicket()

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
      <ButtonLink
        target='_blank'
        href={url}
        theme={ButtonTheme.teal}
        size={size}
        className={className}
      >
        <ThemedClipSpinner className='mr-2' size={12} />
        {t('claiming', 'Claiming')}
      </ButtonLink>
    )
  } else if (claimTx?.status === TransactionStatus.success) {
    btnJsx = (
      <ButtonLink
        target='_blank'
        href={url}
        theme={ButtonTheme.tealOutline}
        size={size}
        className={className}
      >
        {t('viewReceipt', 'View receipt')}
      </ButtonLink>
    )
  } else if (
    checkedState === CheckedState.checked &&
    didUserWinAPrize &&
    hasCheckedAnimationFinished
  ) {
    btnJsx = (
      <Button
        theme={ButtonTheme.rainbow}
        size={size}
        onClick={() => openModal()}
        className={className}
        style={{ minWidth: 230 }}
      >
        {t('viewPrizes', 'View prizes')}
      </Button>
    )
  } else if (
    checkedState === CheckedState.checked &&
    !didUserWinAPrize &&
    hasCheckedAnimationFinished
  ) {
    btnJsx = (
      <Button size={size} disabled className={className}>
        {t('noPrizesToClaim', 'No prizes to claim')}
      </Button>
    )
  } else {
    const isChecking = checkedState !== CheckedState.unchecked
    btnJsx = (
      <Button
        size={size}
        onClick={() => {
          getUserDrawResults(
            prizeDistributor,
            drawDataList,
            usersAddress,
            ticket.address,
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
            {t('checkingForPrizes', 'Checking for prizes')}
          </>
        ) : (
          t('checkForPrizes', 'Check for prizes')
        )}
      </Button>
    )
  }

  return <div className='flex items-center relative'>{btnJsx}</div>
}

MultiDrawsClaimButton.defaultProps = {
  size: ButtonSize.md
}
