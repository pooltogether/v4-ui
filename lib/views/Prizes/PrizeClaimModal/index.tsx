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

interface PrizeClaimModalProps {
  prizeDistributor: PrizeDistributor
  prizePool: PrizePool
  token: Token
  ticket: Token
  isOpen: boolean
  didUserWinAPrize: boolean
  drawDatas: { [drawId: number]: DrawData }
  winningDrawResultsList: DrawResults[]
  claimTx: Transaction
  closeModal: () => void
  setTxId: (txId: number) => void
}

export const PrizeClaimModal = (props: PrizeClaimModalProps) => {
  const {
    winningDrawResultsList,
    drawDatas,
    prizeDistributor,
    token,
    ticket,
    isOpen,
    closeModal,
    claimTx,
    setTxId
  } = props

  const sendTx = useSendTransaction()

  const { chainId } = useSelectedNetwork()
  const { t } = useTranslation()

  const isWalletOnProperNetwork = useIsWalletOnNetwork(chainId)

  const { refetch: refetchClaimedAmounts } = useUsersClaimedAmounts(prizeDistributor)

  const signerPrizeDistributor = useSignerPrizeDistributor(prizeDistributor)
  const sendClaimTx = useCallback(async () => {
    const name = `Claim prizes`
    const txId = await sendTx({
      name,
      method: 'claim',
      callTransaction: async () =>
        signerPrizeDistributor.claimPrizesAcrossMultipleDrawsByDrawResults(winningDrawResultsList),
      callbacks: {
        // onSuccess: onSuccessfulClaim,
        refetch: () => {
          refetchClaimedAmounts()
        }
      }
    })
    setTxId(txId)
  }, [signerPrizeDistributor, winningDrawResultsList])

  if (!winningDrawResultsList) return null

  if (claimTx && claimTx.sent) {
    if (claimTx.error) {
      return (
        <Modal label='Error depositing modal' isOpen={isOpen} closeModal={closeModal}>
          <ModalTitle chainId={chainId} title={t('errorDepositing', 'Error depositing')} />
          <div className='text-white opacity-60'>
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
      <Modal label='Claim prizes modal' isOpen={isOpen} closeModal={closeModal}>
        <ModalTitle chainId={chainId} title={t('claimSubmitted', 'Claim submitted')} />
        <ModalTransactionSubmitted
          className='mt-8'
          chainId={chainId}
          tx={claimTx}
          closeModal={closeModal}
        />
      </Modal>
    )
  }

  const totalPrizesWonUnformatted = winningDrawResultsList.reduce(
    (total, drawResult) => total.add(drawResult.totalValue),
    ethers.BigNumber.from(0)
  )

  const { amountPretty } = roundPrizeAmount(totalPrizesWonUnformatted, ticket.decimals)

  if (!isWalletOnProperNetwork) {
    return (
      <Modal label='Wrong network modal' isOpen={isOpen} closeModal={closeModal}>
        <ModalTitle chainId={chainId} title={t('wrongNetwork', 'Wrong network')} />
        <ModalNetworkGate chainId={chainId} className='mt-8' />
      </Modal>
    )
  }

  return (
    <Modal label='Claim prizes modal' isOpen={isOpen} closeModal={closeModal}>
      <div className='w-full mx-auto flex flex-col max-h-full'>
        <ModalTitle chainId={prizeDistributor.chainId} title={t('claimPrizes', 'Claim prizes')} />

        <div className='flex items-center mx-auto font-bold text-white mb-4 text-3xl'>
          <span className='mr-2'>{amountPretty}</span>
          <TokenSymbolAndIcon chainId={chainId} token={ticket} />
        </div>

        <ul className='space-y-4 overflow-y-auto' style={{ maxHeight: '100%' }}>
          {winningDrawResultsList.map((drawResults) => {
            const drawData = drawDatas[drawResults.drawId]
            return (
              <li>
                <PrizeList
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
          disabled={claimTx?.inWallet && !claimTx.cancelled && !claimTx.completed}
        >
          {t('confirmClaim', 'Confirm claim')}
        </SquareButton>
      </div>
    </Modal>
  )
}
