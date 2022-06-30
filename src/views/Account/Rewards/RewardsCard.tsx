import { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { TransactionResponse } from '@ethersproject/providers'
import {
  BottomSheetTitle,
  ContractLink,
  BottomSheet,
  snapTo90,
  ThemedClipSpinner,
  NetworkIcon,
  TokenIcon,
  CountUp,
  SquareButtonTheme
} from '@pooltogether/react-components'
import { Token, Amount, useToken, useNetworkHexColor } from '@pooltogether/hooks'
import {
  useSendTransaction,
  useUsersAddress,
  useIsWalletOnChainId,
  TransactionState,
  useTransaction
} from '@pooltogether/wallet-connection'
import { numberWithCommas, getNetworkNameAliasByChainId } from '@pooltogether/utilities'
import { useSigner } from 'wagmi'

import { TxButton } from '@components/Input/TxButton'
import { getTwabRewardsContract } from '@utils/TwabRewards/getTwabRewardsContract'
import { useIsWalletMetamask } from '@hooks/useIsWalletMetamask'
import { LoadingList } from '@components/PrizePoolDepositList/LoadingList'
import { CardTitle } from '@components/Text/CardTitle'
import { useAllChainsFilteredPromotions } from '@hooks/v4/TwabRewards/useAllChainsFilteredPromotions'
import { useUsersPromotionRewardsAmount } from '@hooks/v4/TwabRewards/useUsersPromotionRewardsAmount'
import { useUsersPromotionAmountClaimable } from '@hooks/v4/TwabRewards/useUsersPromotionAmountClaimable'
import { useUsersPromotionAmountEstimate } from '@hooks/v4/TwabRewards/useUsersPromotionAmountEstimate'
import { capitalizeFirstLetter, transformHexColor } from '@utils/TwabRewards/misc'
import { loopXTimes } from '@utils/loopXTimes'

// PREDICTION / ESTIMATE:
// (user twab balance for epoch / twab total supply for epoch) * tokensPerEpoch

export const RewardsCard = () => {
  const { t } = useTranslation()

  const queryResults = useAllChainsFilteredPromotions()

  const isFetched = queryResults.every((queryResult) => queryResult.isFetched)
  const isError = queryResults.map((queryResult) => queryResult.isError).filter(Boolean)?.length > 0
  const isAny =
    queryResults
      .map((queryResult) => queryResult.data?.promotions)
      .filter((promotions) => promotions?.length > 0).length > 0

  if (!isAny) {
    return null
  }

  return (
    <div className='flex flex-col space-y-2'>
      <CardTitle title={t('rewards')} loading={!isFetched} />

      {!isFetched && (
        <LoadingList
          listItems={1}
          bgClassName='bg-pt-purple-lightest dark:bg-opacity-40 dark:bg-pt-purple'
        />
      )}

      {isError && (
        <div>
          Unable to fetch rewards data due to subgraph issue, come back to check your rewards later!
        </div>
      )}

      {queryResults.map((queryResult) => {
        const { data } = queryResult || {}
        const { chainId } = data || {}
        if (!data?.promotions || data.promotions.length === 0) {
          return null
        }
        return <ChainPromotions key={`chain-promotions-${chainId}`} queryResult={queryResult} />
      })}
    </div>
  )
}

const ChainPromotions = (props) => {
  const { queryResult } = props

  const { t } = useTranslation()

  const { data } = queryResult
  const { chainId, promotions } = data || {}

  const backgroundColor = useNetworkHexColor(chainId)
  const networkName = capitalizeFirstLetter(getNetworkNameAliasByChainId(chainId))

  return (
    <div
      className='rounded-xl text-white py-5 px-6'
      style={{ backgroundColor: transformHexColor(backgroundColor), minHeight: 100 }}
    >
      <div className='flex items-center font-bold mb-4'>
        <NetworkIcon chainId={chainId} className='mr-2' sizeClassName='w-5 h-5' />
        {t('chainPoolParty', { networkName })}
      </div>
      <PromotionsList chainId={chainId} promotions={promotions} />
    </div>
  )
}

const PromotionsList = (props) => {
  const { chainId, promotions } = props

  return (
    <PromotionList>
      {promotions.map((promotion) => (
        <PromotionRow
          key={`pcard-${chainId}-${promotion.id}`}
          promotion={promotion}
          chainId={chainId}
        />
      ))}
    </PromotionList>
  )
}

const PromotionRow = (props) => {
  const { promotion, chainId } = props
  const { id, maxCompletedEpochId, token: tokenAddress } = promotion

  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)

  const [txId, setTxId] = useState<string>()
  const transaction = useTransaction(txId)
  const [signaturePending, setSignaturePending] = useState(false)
  const transactionPending = transaction?.state === TransactionState.pending || signaturePending

  const isWalletMetaMask = useIsWalletMetamask()
  const isWalletOnProperNetwork = useIsWalletOnChainId(chainId)

  const { data: token, isFetched: tokenIsFetched } = useToken(chainId, tokenAddress)

  const usersAddress = useUsersAddress()

  const { data: usersPromotionData, refetch: refetchUsersRewardsAmount } =
    useUsersPromotionRewardsAmount(chainId, Number(id), maxCompletedEpochId, usersAddress)

  const { id: promotionId } = promotion

  const {
    data: claimable,
    isFetched: claimableIsFetched,
    refetch: refetchClaimable
  } = useUsersPromotionAmountClaimable(chainId, promotionId, usersPromotionData, token)
  const { amount: claimableAmount, usd: claimableUsd } = claimable || {}

  const {
    data: estimate,
    isFetched: estimateIsFetched,
    refetch: refetchEstimate
  } = useUsersPromotionAmountEstimate(chainId, promotion, token)
  const { amount: estimateAmount, usd: estimateUsd } = estimate || {}

  const total = Number(estimateAmount?.amount) + Number(claimableAmount?.amount)

  const refetch = () => {
    refetchUsersRewardsAmount()
    refetchEstimate()
    refetchClaimable()
  }

  // TODO: Contract links
  const contractLinks: ContractLink[] = [
    {
      i18nKey: 'prizePool',
      chainId,
      address: '0xface'
    }
  ]
  const onDismiss = () => setIsOpen(false)

  return (
    <>
      {!tokenIsFetched ? (
        <RewardsCardLoadingList listItems={1} />
      ) : (
        <>
          <PromotionListItem
            onClick={() => {
              // setSelectedChainId(chainId)
              setIsOpen(true)
            }}
            left={
              <div className='flex items-center'>
                <img className='w-5 mr-2' src='beach-with-umbrella.png' /> {token.symbol}{' '}
                {t('rewards')}
              </div>
            }
            right={
              <div className='flex items-center'>
                <TokenIcon
                  chainId={chainId}
                  address={token?.address}
                  sizeClassName='w-5 h-5'
                  className='mr-2'
                />
                <RewardsBalance
                  estimateUsd={estimateUsd}
                  claimableUsd={claimableUsd}
                  isFetched={claimableIsFetched && estimateIsFetched}
                />{' '}
                <FeatherIcon icon='chevron-right' className='my-auto w-6 h-6 opacity-50' />
              </div>
            }
          />

          <BottomSheet
            className='flex flex-col'
            open={isOpen}
            onDismiss={onDismiss}
            label='Claim modal'
            snapPoints={snapTo90}
          >
            <BottomSheetTitle chainId={chainId} title={t('rewards', 'Rewards')} />

            <div className='bg-white dark:bg-actually-black dark:bg-opacity-10 rounded-xl w-full py-6 flex flex-col mb-4'>
              <span
                className={classNames('text-3xl mx-auto font-bold leading-none', {
                  'opacity-50': total !== 0
                })}
              >
                $<CountUp countTo={estimateUsd + claimableUsd} />
              </span>
              <span className='mx-auto flex items-center mt-1'>
                <TokenIcon chainId={chainId} address={token?.address} sizeClassName='w-4 h-4' />
                <span className='font-bold opacity-50 mx-1'>{numberWithCommas(total)}</span>
                <span className='opacity-50'>{token.symbol}</span>
              </span>
            </div>

            <div className='flex items-center space-x-4'>
              <AmountPanel
                label={t('estimated', 'Estimated')}
                chainId={chainId}
                token={token}
                amount={estimateAmount}
                usd={estimateUsd}
              />

              <AmountPanel
                label={t('claimable', 'claimable')}
                chainId={chainId}
                token={token}
                amount={claimableAmount}
                usd={claimableUsd}
              />
            </div>

            <SubmitTransactionButton
              setReceiptView={() => {}}
              dismissModal={onDismiss}
              setIsOpen={setIsOpen}
              claimableAmount={claimableAmount}
              token={token}
              claimableUsd={claimableUsd}
              chainId={chainId}
              promotion={promotion}
              transactionPending={transactionPending}
              setTxId={setTxId}
              refetch={refetch}
            />
          </BottomSheet>
        </>
      )}
    </>
  )
}

const AmountPanel = (props) => {
  const { chainId, label, amount, usd, token } = props

  return (
    <div className='bg-white dark:bg-actually-black dark:bg-opacity-10 rounded-xl w-full py-6 flex flex-col mb-4'>
      {/* <span
        className={classNames('text-xl mx-auto font-bold leading-none', {
          'opacity-50': amount.amount !== 0
        })}
      >
        $<CountUp countTo={amount.amount} />
      </span> */}
      <span className='mx-auto flex items-center mt-1'>
        <TokenIcon chainId={chainId} address={token?.address} sizeClassName='w-4 h-4' />
        <span className='font-bold opacity-50 mx-1'>{numberWithCommas(amount.amount)}</span>
        <span className='opacity-50'>{token.symbol}</span>
      </span>
      <div className='text-center mt-1 opacity-60'>{label}</div>
    </div>
  )
}

// (user twab balance for epoch / twab total supply for epoch) * tokensPerEpoch
// my twab: 200 for epoch 1
// twab total supply (currently for 1 chain): 1000 for epoch 1
// 200/1000 (or 20%) is my vApr
// 30 tokens given away for epoch 1
// = I get 6 tokens for epoch 1
// remaining epochs: 8
// 6 * 8 = 48
// I'll get 48 tokens over the entire time if nothing changes
const RewardsBalance = (props) => {
  const { isFetched, estimateUsd, claimableUsd } = props

  const estimateAndClaimableUsd = estimateUsd + claimableUsd

  return (
    <div
      className={classNames('flex items-center leading-none font-bold mr-3', {
        'opacity-50': estimateAndClaimableUsd <= 0
      })}
    >
      {isFetched ? (
        <>${numberWithCommas(estimateAndClaimableUsd)}</>
      ) : (
        <ThemedClipSpinner sizeClassName='w-4 h-4' className='opacity-70' />
      )}
    </div>
  )
}

interface PromotionListItemProps {
  left: React.ReactNode
  right: React.ReactNode
  onClick: () => void
}

const PromotionListItem = (props: PromotionListItemProps) => {
  const { onClick, left, right } = props

  return (
    <li className='transition bg-white bg-opacity-10 hover:bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 dark:hover:bg-opacity-20 rounded-lg'>
      <button className='px-4 py-2 w-full flex justify-between items-center' onClick={onClick}>
        {left}
        {right}
      </button>
    </li>
  )
}

const PromotionList = (props: {
  className?: string
  bgClassName?: string
  children: React.ReactNode
}) => (
  <ul className={classNames('rounded-lg space-y-2', props.bgClassName, props.className)}>
    {props.children}
  </ul>
)

PromotionList.defaultProps = {}

export const RewardsCardLoadingList = (props: {
  listItems: number
  bgClassName?: string
  className?: string
}) => (
  <ul>
    {loopXTimes(props.listItems, (i) => (
      <li
        key={`loading-list-${i}`}
        className='rounded-lg bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 animate-pulse w-full h-10'
      />
    ))}
  </ul>
)

RewardsCardLoadingList.defaultProps = {
  listItems: 1
}

interface SubmitTransactionButtonProps {
  chainId: number
  promotion: Promotion
  transactionPending: boolean
  token: Token
  claimableAmount: Amount
  claimableUsd: number
  dismissModal: () => void
  setReceiptView: () => void
  setIsOpen: (isOpen: boolean) => void
  setTxId: (id: string) => void
  refetch: () => void
}

/**
 * @param props
 * @returns
 */
const SubmitTransactionButton: React.FC<SubmitTransactionButtonProps> = (props) => {
  const {
    chainId,
    promotion,
    token,
    transactionPending,
    claimableAmount,
    setReceiptView,
    dismissModal,
    setIsOpen,
    setTxId,
    refetch
  } = props

  const { id: promotionId, maxCompletedEpochId } = promotion

  const epochIds = [...Array(maxCompletedEpochId).keys()]
  console.log(epochIds)

  const usersAddress = useUsersAddress()

  const { data: signer } = useSigner()
  const { t } = useTranslation()

  const sendTransaction = useSendTransaction()

  const sendClaimTx = async () => {
    const twabRewardsContract = getTwabRewardsContract(chainId, signer)

    console.log('Claiming for epochs:', epochIds)

    let callTransaction: () => Promise<TransactionResponse>

    try {
      callTransaction = async () =>
        twabRewardsContract.claimRewards(usersAddress, promotionId, epochIds)
    } catch (e) {
      console.error(e)
      return
    }

    const transactionId = sendTransaction({
      name: `${t('claim')} ${numberWithCommas(claimableAmount.amount)} ${token.symbol}`,
      callTransaction,
      callbacks: {
        onConfirmedByUser: () => {
          setReceiptView()
        },
        onSuccess: async () => {
          setIsOpen(false)
          dismissModal()
          refetch()
        }
      }
    })
    setTxId(transactionId)
  }

  const disabled = !signer || transactionPending || Number(claimableAmount.amount) === 0

  return (
    <TxButton
      chainId={chainId}
      disabled={disabled}
      onClick={sendClaimTx}
      className='mt-6 flex w-full items-center justify-center'
      theme={SquareButtonTheme.rainbow}
      // state={claimTx?.state}
      // status={claimTx?.status}
    >
      {t('claim', 'Claim')} {numberWithCommas(claimableAmount.amount)} {token.symbol}
    </TxButton>
  )
}
