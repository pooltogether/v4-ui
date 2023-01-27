import { TxButton } from '@components/Input/TxButton'
import { ModalNetworkGate } from '@components/Modal/ModalNetworkGate'
import { ModalTransactionSubmitted } from '@components/Modal/ModalTransactionSubmitted'
import { VAPRTooltip } from '@components/VAPRTooltip'
import { useSendTransaction } from '@hooks/useSendTransaction'
import { useTokenFaucetData } from '@hooks/v3/useTokenFaucetData'
import { useUsersTokenFaucetRewards } from '@hooks/v3/useUsersTokenFaucetRewards'
import { V3PrizePool } from '@hooks/v3/useV3PrizePools'
import { TokenWithBalance, TokenWithUsdBalance } from '@pooltogether/hooks'
import {
  ModalTitle,
  ButtonTheme,
  ThemedClipSpinner,
  TokenIcon
} from '@pooltogether/react-components'
import { displayPercentage } from '@pooltogether/utilities'
import {
  useUsersAddress,
  Transaction,
  TransactionStatus,
  TransactionState
} from '@pooltogether/wallet-connection'
import { useIsWalletOnChainId, useTransaction } from '@pooltogether/wallet-connection'
import { buildTokenFaucetClaimTx } from '@utils/transactions/buildTokenFaucetClaimTx'
import { Trans, useTranslation } from 'next-i18next'
import { useState } from 'react'
import { useSigner } from 'wagmi'

interface TokenFaucetClaimViewProps {
  chainId: number
  tokenFaucetAddress: string
  prizePool: V3PrizePool
  underlyingToken: TokenWithUsdBalance
  closeModal: () => void
  setExternalClaimTxId: (txId: string) => void
  refetch: () => void
}

export const TokenFaucetClaimView = (props: TokenFaucetClaimViewProps) => {
  const {
    chainId,
    tokenFaucetAddress,
    prizePool,
    underlyingToken,
    closeModal,
    setExternalClaimTxId,
    refetch
  } = props

  const [claimTxId, setInternalClaimTxId] = useState('')
  const claimTx = useTransaction(claimTxId)

  const usersAddress = useUsersAddress()
  const { data: tokenFaucetRewards, refetch: refetchTokenFaucetRewards } =
    useUsersTokenFaucetRewards(
      chainId,
      usersAddress,
      prizePool,
      tokenFaucetAddress,
      underlyingToken
    )
  const { data: tokenFaucetData, isFetched: isTokenFaucetDataFetched } = useTokenFaucetData(
    chainId,
    tokenFaucetAddress,
    prizePool,
    underlyingToken
  )

  const setClaimTxId = (txId: string) => {
    setInternalClaimTxId(txId)
    setExternalClaimTxId(txId)
  }

  const { t } = useTranslation()
  const isWalletOnProperNetwork = useIsWalletOnChainId(chainId)

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

  if (
    claimTx &&
    (claimTx.status === TransactionStatus.pendingBlockchainConfirmation ||
      claimTx.state === TransactionState.complete)
  ) {
    return <ClaimClaimingView chainId={chainId} claimTx={claimTx} closeModal={closeModal} />
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
      vapr={tokenFaucetData?.vapr}
      setClaimTxId={setClaimTxId}
      refetch={() => {
        refetch()
        refetchTokenFaucetRewards()
      }}
    />
  )
}

interface ClaimClaimingViewProps {
  claimTx: Transaction
  chainId: number
  closeModal: () => void
}

const ClaimClaimingView = (props: ClaimClaimingViewProps) => {
  const { chainId, closeModal, claimTx } = props
  const { t } = useTranslation()

  return (
    <>
      <ModalTitle chainId={chainId} title={t('claimSubmitted', 'Claim submitted')} />
      <ModalTransactionSubmitted className='mt-8' chainId={chainId} tx={claimTx} />
    </>
  )
}

export interface ClaimMainViewProps {
  chainId: number
  tokenFaucetAddress: string
  tokenFaucetRewards: TokenWithBalance
  vapr: number
  setClaimTxId: (txId: string) => void
  refetch: () => void
}

const ClaimMainView = (props: ClaimMainViewProps) => {
  const { chainId, vapr, tokenFaucetAddress, tokenFaucetRewards, setClaimTxId, refetch } = props

  const { t } = useTranslation()
  const { refetch: getSigner } = useSigner({ chainId })
  const sendTransaction = useSendTransaction()
  const usersAddress = useUsersAddress()

  const sendClaimTx = async () => {
    const { data: signer } = await getSigner()
    const callTransaction = buildTokenFaucetClaimTx(signer, tokenFaucetAddress, usersAddress)

    const name = t(`claimAmountTicker`, 'Claim {{amount}} {{ticker}}', {
      amount: tokenFaucetRewards.amountPretty,
      ticker: tokenFaucetRewards.symbol
    })
    const txId = await sendTransaction({
      name,
      callTransaction,
      callbacks: {
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

      <div className='bg-white dark:bg-actually-black dark:bg-opacity-10 rounded-xl w-full py-6 flex flex-col mb-4'>
        <h5 className='text-center'>{t('unclaimedRewards', 'Unclaimed rewards')}</h5>
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

      <TxButton
        chainId={chainId}
        disabled={!tokenFaucetRewards.amountUnformatted.gt(0)}
        onClick={sendClaimTx}
        className='mt-6 flex w-full items-center justify-center'
        theme={ButtonTheme.rainbow}
      >
        {t('claim', 'Claim')}
      </TxButton>
    </>
  )
}
