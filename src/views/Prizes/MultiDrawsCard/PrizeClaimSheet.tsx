import { TxButton } from '@components/Input/TxButton'
import { ModalTransactionSubmitted } from '@components/Modal/ModalTransactionSubmitted'
import { PrizeList } from '@components/PrizeList'
import { TokenSymbolAndIcon } from '@components/TokenSymbolAndIcon'
import { TwitterIntentButton } from '@components/TwitterIntentButton'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { useSendTransaction } from '@hooks/useSendTransaction'
import { useSignerPrizeDistributor } from '@hooks/v4/PrizeDistributor/useSignerPrizeDistributor'
import { useUsersClaimedAmounts } from '@hooks/v4/PrizeDistributor/useUsersClaimedAmounts'
import { useUsersPrizePoolBalances } from '@hooks/v4/PrizePool/useUsersPrizePoolBalances'
import { useUsersTotalTwab } from '@hooks/v4/PrizePool/useUsersTotalTwab'
import { useToken, Token, useCoingeckoTokenPrices } from '@pooltogether/hooks'
import {
  SquareButton,
  SquareButtonTheme,
  SquareLink,
  ModalTitle,
  BottomSheet,
  snapTo90
} from '@pooltogether/react-components'
import { numberWithCommas } from '@pooltogether/utilities'
import { DrawResults, PrizeDistributor, PrizePool } from '@pooltogether/v4-client-js'
import {
  useUsersAddress,
  TransactionStatus,
  Transaction,
  useIsWalletOnChainId
} from '@pooltogether/wallet-connection'
import { roundPrizeAmount } from '@utils/roundPrizeAmount'
import { FathomEvent, logEvent } from '@utils/services/fathom'
import classNames from 'classnames'
import { ethers } from 'ethers'
import { useTranslation } from 'next-i18next'
import React, { useCallback, useRef } from 'react'
import Reward, { RewardElement } from 'react-rewards'
import { DrawData } from '../../../interfaces/v4'

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

  const { amountPretty, amount } = roundPrizeAmount(totalPrizesWonUnformatted, ticket.decimals)
  const claimAmountTwitter = tokenUsd ? Number(amount) * tokenUsd : amount

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
          <TwitterIntentButton
            url='https://app.pooltogether.com'
            text={`I just claimed $${numberWithCommas(
              claimAmountTwitter
            )} in winnings from my @pooltogether_ deposit! Join me in saving and winning: `}
          />
        </BottomSheet>
      )
    }
  }

  return (
    <BottomSheet
      snapPoints={snapTo90}
      label='Claim prizes modal'
      className='overflow-hidden'
      open={isOpen}
      onDismiss={() => {
        setTxId('')
        closeModal()
      }}
    >
      <div className='w-full mx-auto flex flex-col max-h-full '>
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
