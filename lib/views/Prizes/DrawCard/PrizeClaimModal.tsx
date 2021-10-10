import React, { useCallback, useState } from 'react'
import { PreTransactionDetails, Transaction } from '@pooltogether/hooks'
// import { Amount, PreTransactionDetails, Token, Transaction } from '@pooltogether/hooks'
import { Modal, SquareButton, SquareButtonTheme } from '@pooltogether/react-components'
import { DrawResults } from '@pooltogether/v4-js-client'
import { useTranslation } from 'react-i18next'

// import { TxButtonNetworkGated } from 'lib/components/Input/TxButtonNetworkGated'
import { ModalWithStyles } from 'lib/components/Modal/ModalWithStyles'
import { ModalNetworkGate } from 'lib/components/Modal/ModalNetworkGate'
import { ModalTitle } from 'lib/components/Modal/ModalTitle'
import { ModalTransactionSubmitted } from 'lib/components/Modal/ModalTransactionSubmitted'
import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'
// import { InfoListItem } from 'lib/components/InfoList'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { DrawPropsWithDetails } from '.'
import { PrizeList } from 'lib/components/PrizeList'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { useSignerPrizeDistributor } from 'lib/hooks/Tsunami/PrizeDistributor/useSignerPrizeDistributor'
import { StoredDrawStates, updateStoredDrawResultState } from 'lib/utils/drawResultsStorage'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { usePastDrawsForUser } from 'lib/hooks/Tsunami/PrizeDistributor/usePastDrawsForUser'

interface PrizeClaimModalProps extends DrawPropsWithDetails {
  isOpen: boolean
  closeModal: () => void
  drawResults: DrawResults
  claimTx: Transaction
  sendTx: (txDetails: PreTransactionDetails) => Promise<number>
  setTxId: (txId: number) => void
}

enum ModalState {
  viewPrizes,
  reviewTransaction
}

export const PrizeClaimModal = (props: PrizeClaimModalProps) => {
  const {
    drawResults,
    prizeDistributor,
    token,
    ticket,
    isOpen,
    closeModal,
    claimTx,
    sendTx,
    setTxId,
    refetchUsersBalances
  } = props

  const [chainId] = useSelectedNetwork()
  const { t } = useTranslation()

  const isWalletOnProperNetwork = useIsWalletOnNetwork(chainId)
  const usersAddress = useUsersAddress()
  const [modalState, setModalState] = useState<ModalState>(ModalState.viewPrizes)

  const { refetch: refetchClaimedAmounts } = usePastDrawsForUser(prizeDistributor, token)

  const onSuccessfulClaim = (tx: Transaction) => {
    updateStoredDrawResultState(
      usersAddress,
      prizeDistributor,
      drawResults.drawId,
      StoredDrawStates.claimed
    )
  }

  const signerPrizeDistributor = useSignerPrizeDistributor(prizeDistributor)
  const sendClaimTx = useCallback(async () => {
    const name = `Claim prizes`
    const txId = await sendTx({
      name,
      method: 'claim',
      callTransaction: async () => signerPrizeDistributor.claimPrizesByDrawResults(drawResults),
      callbacks: {
        onSuccess: onSuccessfulClaim,
        refetch: () => {
          refetchUsersBalances()
          refetchClaimedAmounts()
        }
      }
    })
    setTxId(txId)
  }, [signerPrizeDistributor, drawResults])

  if (!drawResults) return null

  if (claimTx && claimTx.sent) {
    if (claimTx.error) {
      return (
        <ModalWithStyles label='Error depositing modal' isOpen={isOpen} closeModal={closeModal}>
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
        </ModalWithStyles>
      )
    }

    return (
      <ModalWithStyles label='Claim prizes modal' isOpen={isOpen} closeModal={closeModal}>
        <ModalTitle chainId={chainId} title={t('claimSubmitted', 'Claim submitted')} />
        <ModalTransactionSubmitted
          className='mt-8'
          chainId={chainId}
          tx={claimTx}
          closeModal={closeModal}
        />
      </ModalWithStyles>
    )
  }

  const { amountPretty } = getAmountFromBigNumber(drawResults.totalValue, ticket.decimals)

  if (modalState === ModalState.viewPrizes) {
    return (
      <ModalWithStyles label='Claim prizes modal' isOpen={isOpen} closeModal={closeModal}>
        <ModalTitle chainId={prizeDistributor.chainId} title={t('claimPrizes', 'Claim prizes')} />

        <div className='w-full mx-auto mt-4 flex flex-col'>
          <div className='mx-auto font-bold text-white mb-4'>
            <span className='text-3xl '>{amountPretty}</span>
            <span className='text-xl ml-2'>{token.symbol}</span>
          </div>

          <PrizeList prizes={drawResults.prizes} ticket={ticket} token={token} />

          <SquareButton
            className='mt-8 w-full'
            onClick={() => {
              // setModalState(ModalState.reviewTransaction)
              sendClaimTx()
            }}
            disabled={claimTx?.inWallet && !claimTx.cancelled && !claimTx.completed}
          >
            {t('confirmClaim', 'Confirm claim')}
          </SquareButton>
        </div>
      </ModalWithStyles>
    )
  }

  if (!isWalletOnProperNetwork) {
    return (
      <ModalWithStyles label='Wrong network modal' isOpen={isOpen} closeModal={closeModal}>
        <ModalTitle chainId={chainId} title={t('wrongNetwork', 'Wrong network')} />
        <ModalNetworkGate chainId={chainId} className='mt-8' />
      </ModalWithStyles>
    )
  }

  return null
  // return (
  //   <ModalWithStyles label='Network gated modal' isOpen={isOpen} closeModal={closeModal}>
  //     <ModalTitle chainId={prizeDistributor.chainId} title={t('claimPrizes', 'Claim prizes')} />

  //     <div className='w-full mx-auto mt-4 flex flex-col'>
  //       <div className='mx-auto font-bold text-flashy mb-4'>
  //         <span className='text-3xl '>{amountPretty}</span>
  //         <span className='text-xl ml-2'>{token.symbol}</span>
  //       </div>

  //       <PrizeList prizes={drawResults.prizes} ticket={ticket} token={token} />

  //       <TxButtonNetworkGated
  //         className='mt-8 w-full'
  //         chainId={chainId}
  //         toolTipId={`deposit-tx-${chainId}`}
  //         onClick={() => {
  //           console.log('wat 2')

  //           // from what I can tell this state isn't necessary ...
  //           sendClaimTx()
  //         }}
  //         disabled={claimTx?.inWallet && !claimTx.cancelled && !claimTx.completed}
  //       >
  //         {t('confirmClaim', 'Confirm claim')}
  //       </TxButtonNetworkGated>
  //     </div>
  //   </ModalWithStyles>
  // )
}

// const AmountToRecieve = (props: { amount: Amount; ticket: Token }) => {
//   const { amount, ticket } = props
//   const { t } = useTranslation()
//   return (
//     <InfoListItem
//       label={t('tickerToReceive', { ticker: ticket.symbol })}
//       value={amount.amountPretty}
//     />
//   )
// }
