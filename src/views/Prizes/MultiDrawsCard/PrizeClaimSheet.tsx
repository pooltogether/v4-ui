import React, { useCallback, useRef } from 'react'
import { Token } from '@pooltogether/hooks'
import {
  Button,
  ButtonTheme,
  ModalTitle,
  BottomSheet,
  snapTo90
} from '@pooltogether/react-components'
import { DrawResults, PrizeDistributorV2, PrizePool } from '@pooltogether/v4-client-js'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'
import {
  useUsersAddress,
  TransactionStatus,
  Transaction,
  useIsWalletOnChainId
} from '@pooltogether/wallet-connection'
import Reward, { RewardElement } from 'react-rewards'

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
import { useUsersPrizePoolBalancesWithFiat } from '@hooks/v4/PrizePool/useUsersPrizePoolBalancesWithFiat'
import { FathomEvent, logEvent } from '@utils/services/fathom'
import { TxButton } from '@components/Input/TxButton'

const CLAIMING_BASE_GAS_LIMIT = 200000
const CLAIMING_PER_DRAW_GAS_LIMIT = 300000

// TODO: Show a gas estimate on this page. So users don't wait 2 months only to realize gas is insane.
interface PrizeClaimSheetProps {
  prizeDistributor: PrizeDistributorV2
  prizePool: PrizePool
  ticket: Token
  token: Token
  prizeToken: Token
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
    ticket,
    token,
    prizeToken,
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

  const isWalletOnProperNetwork = useIsWalletOnChainId(chainId)

  const usersAddress = useUsersAddress()
  const { refetch: refetchClaimedAmounts } = useUsersClaimedAmounts(usersAddress, prizeDistributor)
  const { refetch: refetchUsersTotalTwab } = useUsersTotalTwab(usersAddress)
  const { refetch: refetchUsersBalances } = useUsersPrizePoolBalancesWithFiat(
    usersAddress,
    prizePool
  )

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
          ticket.address,
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
          <Button
            theme={ButtonTheme.tealOutline}
            className='w-full'
            onClick={() => {
              setTxId('')
              closeModal()
            }}
          >
            {t('tryAgain', 'Try again')}
          </Button>
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
        </BottomSheet>
      )
    }
  }

  const winningDrawResultsList = Object.values(winningDrawResults)
  const totalPrizesWonUnformatted = winningDrawResultsList.reduce((total, drawResult) => {
    if (!drawIdsToNotClaim.has(drawResult.drawId)) {
      return total.add(drawResult.totalValue)
    }
    return total
  }, ethers.BigNumber.from(0))

  const { amountPretty } = roundPrizeAmount(totalPrizesWonUnformatted, prizeToken.decimals)

  const drawIdsToClaim = winningDrawResultsList.filter(
    (drawResult) => !drawIdsToNotClaim.has(drawResult.drawId)
  )

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
          <TokenSymbolAndIcon chainId={chainId} token={prizeToken} />
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
                  prizeToken={prizeToken}
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
          theme={isWalletOnProperNetwork ? ButtonTheme.rainbow : ButtonTheme.teal}
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
