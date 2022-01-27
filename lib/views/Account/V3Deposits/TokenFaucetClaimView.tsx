import { TokenWithBalance, Transaction, useTransaction } from '.yalc/@pooltogether/hooks/dist'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import {
  ModalTitle,
  SquareButton,
  SquareButtonTheme,
  ThemedClipSpinner,
  TokenIcon
} from '@pooltogether/react-components'
import { displayPercentage } from '@pooltogether/utilities'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { ModalNetworkGate } from 'lib/components/Modal/ModalNetworkGate'
import { ModalTransactionSubmitted } from 'lib/components/Modal/ModalTransactionSubmitted'
import { VAPRTooltip } from 'lib/components/VAPRTooltip'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { buildTokenFaucetClaimTx } from 'lib/transactions/buildTokenFaucetClaimTx'

interface TokenFaucetClaimViewProps {
  chainId: number
  tokenFaucetAddress: string
  tokenFaucetRewards: TokenWithBalance
  vapr: number
  isTokenFaucetDataFetched: boolean
  closeInitialSheet: () => void
  setExternalClaimTxId: (txId: number) => void
  refetch: () => void
}

export enum ClaimViews {
  'main',
  'claiming'
}

export const TokenFaucetClaimView = (props: TokenFaucetClaimViewProps) => {
  const {
    chainId,
    tokenFaucetRewards,
    vapr,
    tokenFaucetAddress,
    isTokenFaucetDataFetched,
    closeInitialSheet,
    setExternalClaimTxId,
    refetch
  } = props

  const [claimTxId, setInternalClaimTxId] = useState(0)
  const claimTx = useTransaction(claimTxId)

  const setClaimTxId = (txId: number) => {
    setInternalClaimTxId(txId)
    setExternalClaimTxId(txId)
  }

  const { t } = useTranslation()
  const isWalletOnProperNetwork = useIsWalletOnNetwork(chainId)

  if (!isTokenFaucetDataFetched) {
    return (
      <div className={'flex flex-col text-accent-1'}>
        <ThemedClipSpinner className='mx-auto mb-8' sizeClassName='w-10 h-10' />

        <div className='text-inverse opacity-60'>
          <p className='mb-4 text-center mx-8'>
            {t('dataIsLoading', `Loading some data from the blockchain.`)}
          </p>
          <p className='text-center mx-8'>
            {t('thisMightTakeAFewSeconds', `This might take a few seconds.`)}
          </p>
        </div>
      </div>
    )
  }

  if (claimTx && claimTx.sent) {
    return (
      <ClaimClaimingView
        chainId={chainId}
        claimTx={claimTx}
        closeInitialSheet={closeInitialSheet}
      />
    )
  }

  if (!isWalletOnProperNetwork) {
    return (
      <>
        <ModalTitle chainId={chainId} title={t('wrongNetwork', 'Wrong network')} />
        <ModalNetworkGate chainId={chainId} className='mt-8' />
      </>
    )
  }

  return (
    <ClaimMainView
      chainId={chainId}
      tokenFaucetAddress={tokenFaucetAddress}
      tokenFaucetRewards={tokenFaucetRewards}
      vapr={vapr}
      setClaimTxId={setClaimTxId}
      refetch={refetch}
    />
  )
}

interface ClaimClaimingViewProps {
  claimTx: Transaction
  chainId: number
  closeInitialSheet: () => void
}

const ClaimClaimingView = (props: ClaimClaimingViewProps) => {
  const { chainId, closeInitialSheet, claimTx } = props
  const { t } = useTranslation()

  return (
    <>
      <ModalTitle chainId={chainId} title={t('claimSubmitted', 'Claim submitted')} />
      <ModalTransactionSubmitted
        className='mt-8'
        chainId={chainId}
        tx={claimTx}
        closeModal={closeInitialSheet}
      />
    </>
  )
}

export interface ClaimMainViewProps {
  chainId: number
  tokenFaucetAddress: string
  tokenFaucetRewards: TokenWithBalance
  vapr: number
  setClaimTxId: (txId: number) => void
  refetch: () => void
}

const ClaimMainView = (props: ClaimMainViewProps) => {
  const { chainId, vapr, tokenFaucetAddress, tokenFaucetRewards, setClaimTxId, refetch } = props

  const { t } = useTranslation()
  const { provider } = useOnboard()
  const sendTx = useSendTransaction()
  const usersAddress = useUsersAddress()

  const onSuccess = (tx: Transaction) => {
    setClaimTxId(0)
  }

  const sendClaimTx = async () => {
    const callTransaction = buildTokenFaucetClaimTx(provider, tokenFaucetAddress, usersAddress)

    const name = t(`claimAmountTicker`, 'Claim {{amount}} {{ticker}}', {
      amount: tokenFaucetRewards.amountPretty,
      ticker: tokenFaucetRewards.symbol
    })
    const txId = await sendTx({
      name,
      method: 'claim',
      callTransaction,
      callbacks: {
        onSuccess,
        refetch
      }
    })
    setClaimTxId(txId)
  }

  return (
    <>
      <ModalTitle
        chainId={chainId}
        title={`${t('claim')}: ${tokenFaucetRewards.symbol}`}
        className='mb-4'
      />

      {/* <h5 className='pt-4 text-center'>
        {t('unclaimedRewards', 'Unclaimed rewards')}{' '}
        <span className='opacity-50 font-normal'> ${dripToken.balanceUsd.amountPretty}</span>
      </h5> */}

      <div className='bg-white dark:bg-actually-black dark:bg-opacity-10 rounded-xl w-full py-6 flex flex-col mb-4'>
        <span className={'text-3xl mx-auto font-bold leading-none'}>
          {tokenFaucetRewards.amountPretty}
        </span>
        <span className='mx-auto flex mt-1'>
          <TokenIcon
            chainId={chainId}
            address={tokenFaucetRewards.address}
            sizeClassName='w-6 h-6'
          />
          <span className='ml-2 opacity-50'>{tokenFaucetRewards.symbol}</span>
        </span>
      </div>

      <div
        className='relative rounded-lg p-4 text-white mt-2 mb-4 text-center font-semibold'
        style={{
          backgroundImage: 'linear-gradient(300deg, #eC2BB8 0%, #EA69D6 100%)'
        }}
      >
        <Trans
          i18nKey='earningPercentageVAPR'
          defaults='Earning {{percentage}}% <tooltip>vAPR</tooltip>'
          values={{ percentage: displayPercentage(String(vapr)) }}
          components={{
            tooltip: <VAPRTooltip />
          }}
        />
      </div>

      <div className='mt-6'>
        <SquareButton
          disabled={!tokenFaucetRewards.amountUnformatted.gt(0)}
          onClick={sendClaimTx}
          className='flex w-full items-center justify-center'
          theme={SquareButtonTheme.rainbow}
        >
          {t('claim', 'Claim')}
        </SquareButton>
      </div>
    </>
  )
}
