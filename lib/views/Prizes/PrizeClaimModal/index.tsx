import React, { useCallback } from 'react'
import { Token, Transaction } from '@pooltogether/hooks'
import { Modal, SquareButton, SquareButtonTheme } from '@pooltogether/react-components'
import { DrawResults, PrizeDistributor, PrizePool } from '@pooltogether/v4-js-client'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'

import { ModalNetworkGate } from 'lib/components/Modal/ModalNetworkGate'
import { ModalTitle } from 'lib/components/Modal/ModalTitle'
import { ModalTransactionSubmitted } from 'lib/components/Modal/ModalTransactionSubmitted'
import { TokenSymbolAndIcon } from 'lib/components/TokenSymbolAndIcon'
import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { PrizeList } from 'lib/components/PrizeList'
import { useSignerPrizeDistributor } from 'lib/hooks/Tsunami/PrizeDistributor/useSignerPrizeDistributor'
import { roundPrizeAmount } from 'lib/utils/roundPrizeAmount'
import { useUsersClaimedAmounts } from 'lib/hooks/Tsunami/PrizeDistributor/useUsersClaimedAmounts'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { DrawData } from 'lib/types/v4'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'

const CLAIMING_GAS_LIMIT = 500000

interface PrizeClaimModalProps {
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
  setTxId: (txId: number) => void
}

export const PrizeClaimModal = (props: PrizeClaimModalProps) => {
  const {
    winningDrawResults,
    drawDatas,
    prizeDistributor,
    token,
    ticket,
    isOpen,
    drawIdsToNotClaim,
    addDrawIdToClaim,
    removeDrawIdToClaim,
    closeModal,
    claimTx,
    setTxId
  } = props

  const sendTx = useSendTransaction()

  const { chainId } = useSelectedNetwork()
  const { t } = useTranslation()

  const isWalletOnProperNetwork = useIsWalletOnNetwork(chainId)

  const usersAddress = useUsersAddress()
  const { refetch: refetchClaimedAmounts } = useUsersClaimedAmounts(usersAddress, prizeDistributor)

  const signerPrizeDistributor = useSignerPrizeDistributor(prizeDistributor)
  const sendClaimTx = useCallback(async () => {
    const name = `Claim prizes`
    const txId = await sendTx({
      name,
      method: 'claim',
      callTransaction: async () => {
        const winningDrawResultsList = Object.values(winningDrawResults).filter((drawResults) => {
          return !drawIdsToNotClaim.has(drawResults.drawId)
        })
        const overrides = { gasLimit: CLAIMING_GAS_LIMIT * winningDrawResultsList.length }
        return signerPrizeDistributor.claimPrizesAcrossMultipleDrawsByDrawResults(
          winningDrawResultsList,
          overrides
        )
      },
      callbacks: {
        // onSuccess: onSuccessfulClaim,
        refetch: () => {
          refetchClaimedAmounts()
        }
      }
    })
    setTxId(txId)
  }, [signerPrizeDistributor, winningDrawResults, drawIdsToNotClaim])

  if (!winningDrawResults) return null

  if (claimTx && claimTx.sent) {
    if (claimTx.error) {
      return (
        <Modal
          label='Error depositing modal'
          isOpen={isOpen}
          closeModal={() => {
            setTxId(0)
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
              setTxId(0)
              closeModal()
            }}
          >
            {t('tryAgain', 'Try again')}
          </SquareButton>
        </Modal>
      )
    }

    return (
      <Modal
        label='Claim prizes modal'
        isOpen={isOpen}
        closeModal={() => {
          setTxId(0)
          closeModal()
        }}
      >
        <ModalTitle chainId={chainId} title={t('claimSubmitted', 'Claim submitted')} />
        <ModalTransactionSubmitted
          className='mt-8'
          chainId={chainId}
          tx={claimTx}
          closeModal={() => {
            setTxId(0)
            closeModal()
          }}
        />
      </Modal>
    )
  }

  const winningDrawResultsList = Object.values(winningDrawResults)
  const totalPrizesWonUnformatted = winningDrawResultsList.reduce((total, drawResult) => {
    if (!drawIdsToNotClaim.has(drawResult.drawId)) {
      return total.add(drawResult.totalValue)
    }
    return total
  }, ethers.BigNumber.from(0))

  const { amountPretty } = roundPrizeAmount(totalPrizesWonUnformatted, ticket.decimals)

  if (!isWalletOnProperNetwork) {
    return (
      <Modal
        label='Wrong network modal'
        isOpen={isOpen}
        closeModal={() => {
          setTxId(0)
          closeModal()
        }}
      >
        <ModalTitle chainId={chainId} title={t('wrongNetwork', 'Wrong network')} />
        <ModalNetworkGate chainId={chainId} className='mt-8' />
      </Modal>
    )
  }

  const drawIdsToClaim = winningDrawResultsList.filter(
    (drawResult) => !drawIdsToNotClaim.has(drawResult.drawId)
  )

  return (
    <Modal
      label='Claim prizes modal'
      isOpen={isOpen}
      closeModal={() => {
        setTxId(0)
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

        <SquareButton
          className='mt-8 w-full'
          onClick={() => {
            sendClaimTx()
          }}
          theme={SquareButtonTheme.rainbow}
          disabled={
            (claimTx?.inWallet && !claimTx.cancelled && !claimTx.completed) ||
            drawIdsToClaim.length === 0
          }
        >
          {t('confirmClaim', 'Confirm claim')}
        </SquareButton>
      </div>
    </Modal>
  )
}
