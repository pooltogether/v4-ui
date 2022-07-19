import React, { useCallback, useRef } from 'react'
import classNames from 'classnames'
import { useToken, Token, useCoingeckoTokenPrices } from '@pooltogether/hooks'
import {
  SquareButton,
  SquareButtonTheme,
  SquareLink,
  ModalTitle,
  BottomSheet,
  snapTo90
} from '@pooltogether/react-components'
import { DrawResults, PrizeDistributor, PrizePool } from '@pooltogether/v4-client-js'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'
import {
  useUsersAddress,
  TransactionStatus,
  Transaction,
  useIsWalletOnChainId
} from '@pooltogether/wallet-connection'
import Reward, { RewardElement } from 'react-rewards'

import { ModalNetworkGate } from '@components/Modal/ModalNetworkGate'
import { ModalTransactionSubmitted } from '@components/Modal/ModalTransactionSubmitted'
import { TokenSymbolAndIcon } from '@components/TokenSymbolAndIcon'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { PrizeList } from '@components/PrizeList'
import { useSignerPrizeDistributor } from '@hooks/v4/PrizeDistributor/useSignerPrizeDistributor'
import { roundPrizeAmount } from '@utils/roundPrizeAmount'
import { useUsersClaimedAmounts } from '@hooks/v4/PrizeDistributor/useUsersClaimedAmounts'
import { useSendTransaction } from '@hooks/useSendTransaction'
import { DrawData } from '../../../interfaces/v4'
import { useUsersTotalTwab } from '@hooks/v4/PrizePool/useUsersTotalTwab'
import { useUsersPrizePoolBalances } from '@hooks/v4/PrizePool/useUsersPrizePoolBalances'
import { FathomEvent, logEvent } from '@utils/services/fathom'
import { TxButton } from '@components/Input/TxButton'

const CLAIMING_BASE_GAS_LIMIT = 200000
const CLAIMING_PER_DRAW_GAS_LIMIT = 300000

interface PrizeClaimSheetProps {
  prizeDistributor: PrizeDistributor
  prizePool: PrizePool
  token: Token
  ticket: Token
  isOpen: boolean
  drawDatas: { [drawId: number]: DrawData }
  winningDrawResults: { [drawId: number]: DrawResults }
  drawIdsToNotClaim: Set<number>
  addDrawIdToClaim: (drawId: number) => void
  removeDrawIdToClaim: (drawId: number) => void
  claimTx: Transaction
  closeModal: () => void
  setTxId: (txId: string) => void
}

export const PrizeClaimSheet = (props: PrizeClaimSheetProps) => {
  const {
    winningDrawResults,
    drawDatas,
    prizeDistributor,
    token,
    ticket,
    isOpen,
    drawIdsToNotClaim,
    prizePool,
    addDrawIdToClaim,
    removeDrawIdToClaim,
    closeModal,
    claimTx,
    setTxId
  } = props

  const sendTransaction = useSendTransaction()
  const rewardRef = useRef<RewardElement>(null)

  const { chainId } = useSelectedChainId()
  const { t } = useTranslation()

  const { data: tokenPrices } = useCoingeckoTokenPrices(chainId, [ticket.address])
  const tokenUsd = tokenPrices?.[ticket.address]?.usd

  const isWalletOnProperNetwork = useIsWalletOnChainId(chainId)

  const usersAddress = useUsersAddress()
  const { refetch: refetchClaimedAmounts } = useUsersClaimedAmounts(usersAddress, prizeDistributor)
  const { refetch: refetchUsersTotalTwab } = useUsersTotalTwab(usersAddress)
  const { refetch: refetchUsersBalances } = useUsersPrizePoolBalances(usersAddress, prizePool)

  const signerPrizeDistributor = useSignerPrizeDistributor(prizeDistributor)
  const sendClaimTx = useCallback(async () => {
    const name = `Claim prizes`
    const txId = await sendTransaction({
      name,
      callTransaction: async () => {
        const winningDrawResultsList = Object.values(winningDrawResults).filter((drawResults) => {
          return !drawIdsToNotClaim.has(drawResults.drawId)
        })
        const overrides = {
          gasLimit:
            CLAIMING_BASE_GAS_LIMIT + CLAIMING_PER_DRAW_GAS_LIMIT * winningDrawResultsList.length
        }
        return signerPrizeDistributor.claimPrizesAcrossMultipleDrawsByDrawResults(
          winningDrawResultsList,
          overrides
        )
      },
      callbacks: {
        onConfirmedByUser: () => logEvent(FathomEvent.prizeClaim),
        refetch: () => {
          refetchUsersTotalTwab()
          refetchUsersBalances()
          refetchClaimedAmounts()
        }
      }
    })
    setTxId(txId)
  }, [signerPrizeDistributor, winningDrawResults, drawIdsToNotClaim])

  if (!winningDrawResults) return null

  const winningDrawResultsList = Object.values(winningDrawResults)
  const totalPrizesWonUnformatted = winningDrawResultsList.reduce((total, drawResult) => {
    if (!drawIdsToNotClaim.has(drawResult.drawId)) {
      return total.add(drawResult.totalValue)
    }
    return total
  }, ethers.BigNumber.from(0))

  const { amountPretty } = roundPrizeAmount(totalPrizesWonUnformatted, ticket.decimals)

  const drawIdsToClaim = winningDrawResultsList.filter(
    (drawResult) => !drawIdsToNotClaim.has(drawResult.drawId)
  )

  if (claimTx) {
    if (claimTx.status === TransactionStatus.error) {
      return (
        <BottomSheet
          snapPoints={snapTo90}
          label='Error depositing modal'
          open={isOpen}
          onDismiss={() => {
            setTxId('')
            closeModal()
          }}
        >
          <ModalTitle chainId={chainId} title={t('errorDepositing', 'Error depositing')} />
          <div className='text-inverse opacity-60'>
            <p className='my-2 text-center mx-8'>😔 {t('ohNo', 'Oh no')}!</p>
            <p className='mb-8 text-center mx-8'>
              {t(
                'somethingWentWrongWithTx',
                'Something went wrong while processing your transaction.'
              )}
            </p>
          </div>
          <SquareButton
            theme={SquareButtonTheme.tealOutline}
            className='w-full'
            onClick={() => {
              setTxId('')
              closeModal()
            }}
          >
            {t('tryAgain', 'Try again')}
          </SquareButton>
        </BottomSheet>
      )
    } else if (
      claimTx.status === TransactionStatus.pendingBlockchainConfirmation ||
      claimTx.status === TransactionStatus.success
    ) {
      return (
        <BottomSheet
          label='Claim prizes modal'
          open={isOpen}
          onDismiss={() => {
            setTxId('')
            closeModal()
          }}
        >
          <ModalTitle chainId={chainId} title={t('claimSubmitted', 'Claim submitted')} />
          <ModalTransactionSubmitted className='mt-8' chainId={chainId} tx={claimTx} />

          <SquareLink
            href={`http://twitter.com/intent/tweet?text=I just claimed $${
              tokenUsd ? Number(amountPretty) * tokenUsd : amountPretty
            } in winnings from my @pooltogether deposit! Join me in saving and winning: &url=https://app.pooltogether.com`}
            target='_blank'
            className='w-full flex items-center mx-auto mt-4'
          >
            <TwitterIconSvg className='w-5 mr-2' /> {t('shareTweet', 'Share Tweet')}
          </SquareLink>
        </BottomSheet>
      )
    }
  }

  return (
    <BottomSheet
      snapPoints={snapTo90}
      label='Claim prizes modal'
      open={isOpen}
      onDismiss={() => {
        setTxId('')
        closeModal()
      }}
    >
      <div className='w-full mx-auto flex flex-col max-h-full'>
        <ModalTitle chainId={prizeDistributor.chainId} title={t('claimPrizes', 'Claim prizes')} />

        <div className='flex items-center mx-auto font-bold text-inverse mb-4 text-3xl'>
          <span className='mr-2'>{amountPretty}</span>
          <TokenSymbolAndIcon chainId={chainId} token={ticket} />
        </div>

        <ul className='space-y-4 overflow-y-auto' style={{ maxHeight: '100%' }}>
          {winningDrawResultsList.reverse().map((drawResults) => {
            const drawData = drawDatas[drawResults.drawId]
            return (
              <li key={`prize_list_draw_id_${drawResults.drawId}`}>
                <PrizeList
                  drawIdsToNotClaim={drawIdsToNotClaim}
                  addDrawIdToClaim={addDrawIdToClaim}
                  removeDrawIdToClaim={removeDrawIdToClaim}
                  chainId={prizeDistributor.chainId}
                  drawResults={drawResults}
                  ticket={ticket}
                  token={token}
                  drawData={drawData}
                />
              </li>
            )
          })}
        </ul>

        {/* Centered container for the confetti to come from */}
        <div className='mx-auto w-0.5'>
          <Reward
            ref={(ref) => (rewardRef.current = ref)}
            type='confetti'
            config={{
              springAnimation: false,
              zIndex: 4,
              colors: ['#17e1fd', '#4c249f', '#ff77e1', '#fff177']
            }}
          >
            <div />
          </Reward>
        </div>

        <TxButton
          chainId={prizeDistributor.chainId}
          className='mt-8 w-full'
          onClick={() => {
            rewardRef.current.rewardMe()
            sendClaimTx()
          }}
          theme={isWalletOnProperNetwork ? SquareButtonTheme.rainbow : SquareButtonTheme.teal}
          state={claimTx?.state}
          status={claimTx?.status}
          disabled={drawIdsToClaim.length === 0}
          type='button'
        >
          {t('confirmClaim', 'Confirm claim')}
        </TxButton>
      </div>
    </BottomSheet>
  )
}

export const TwitterIconSvg = (props) => {
  return (
    <svg
      {...props}
      className={classNames(props.className, 'fill-current')}
      width='100%'
      viewBox='0 0 21 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M6.604 16c7.925 0 12.259-6.156 12.259-11.495 0-.175 0-.349-.013-.522A8.484 8.484 0 0021 1.892a9.05 9.05 0 01-2.475.635A4.112 4.112 0 0020.42.293a8.991 8.991 0 01-2.736.98 4.408 4.408 0 00-2.445-1.22 4.563 4.563 0 00-2.732.425 4.162 4.162 0 00-1.893 1.896 3.813 3.813 0 00-.273 2.584 12.874 12.874 0 01-4.918-1.225A12.12 12.12 0 011.462.737 3.826 3.826 0 00.99 3.681c.248 1.002.893 1.878 1.806 2.45A4.496 4.496 0 01.84 5.623v.052c0 .932.345 1.836.975 2.558a4.368 4.368 0 002.482 1.402 4.58 4.58 0 01-1.946.07 4.064 4.064 0 001.533 2.007 4.502 4.502 0 002.492.798 9.018 9.018 0 01-5.35 1.733c-.343-.001-.686-.02-1.026-.059a12.795 12.795 0 006.604 1.812' />
    </svg>
  )
}
