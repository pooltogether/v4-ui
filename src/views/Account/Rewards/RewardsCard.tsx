import { useState } from 'react'
import Link from 'next/link'
import FeatherIcon from 'feather-icons-react'
import classNames from 'classnames'
import { Trans, useTranslation } from 'react-i18next'
import { TransactionResponse } from '@ethersproject/providers'
import { format } from 'date-fns'
import {
  Tooltip,
  BottomSheet,
  BottomSheetTitle,
  // ContractLink,
  snapTo90,
  ThemedClipSpinner,
  NetworkIcon,
  TokenIcon,
  SquareButtonTheme,
  SquareLink,
  SquareButtonSize
} from '@pooltogether/react-components'
import { Token, Amount, useToken, useNetworkHexColor } from '@pooltogether/hooks'
import {
  useSendTransaction,
  useUsersAddress,
  useIsWalletOnChainId,
  TransactionState,
  useTransaction,
  Transaction
} from '@pooltogether/wallet-connection'
import {
  displayPercentage,
  numberWithCommas,
  getNetworkNameAliasByChainId,
  sToMs
} from '@pooltogether/utilities'
import { useSigner } from 'wagmi'

import { ClaimedPromotion, Promotion } from '@interfaces/promotions'
import { TxButton } from '@components/Input/TxButton'
import { PrizeWLaurels } from '@components/Images/PrizeWithLaurels'
import { LoadingList } from '@components/PrizePoolDepositList/LoadingList'
import { CardTitle } from '@components/Text/CardTitle'
import { TransactionReceiptButton } from '@components/TransactionReceiptButton'
import { VAPRTooltip } from '@components/VAPRTooltip'
import { useAllChainsFilteredPromotions } from '@hooks/v4/TwabRewards/useAllChainsFilteredPromotions'
import { useUsersRewardsHistory } from '@hooks/v4/TwabRewards/useUsersRewardsHistory'
import { useUsersPromotionRewardsAmount } from '@hooks/v4/TwabRewards/useUsersPromotionRewardsAmount'
import { useUsersPromotionAmountClaimable } from '@hooks/v4/TwabRewards/useUsersPromotionAmountClaimable'
import { useUsersPromotionAmountEstimate } from '@hooks/v4/TwabRewards/useUsersPromotionAmountEstimate'
import { capitalizeFirstLetter, transformHexColor } from '@utils/TwabRewards/misc'
import {
  useNextRewardIn,
  useEstimateRows,
  usePromotionDaysRemaining,
  usePromotionVAPR
} from '@hooks/v4/TwabRewards/promotionHooks'
import { getTwabRewardsContract } from '@utils/TwabRewards/getTwabRewardsContract'
import { loopXTimes } from '@utils/loopXTimes'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'

enum ClaimModalState {
  'FORM',
  'RECEIPT',
  'COMPLETED'
}

export const RewardsCard = () => {
  const { t } = useTranslation()

  const promotionsQueryResults = useAllChainsFilteredPromotions()

  const isFetched = promotionsQueryResults.every((queryResult) => queryResult.isFetched)
  const isError = promotionsQueryResults.some((result) => result.isError)
  const isAny =
    promotionsQueryResults
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

      {promotionsQueryResults.map((queryResult) => {
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
      className='rounded-xl text-white p-4'
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

  const {
    data: usersRewardsHistory,
    isError: usersRewardsHistoryError,
    refetch: refetchUsersRewardsHistory
  } = useUsersRewardsHistory(chainId)
  if (usersRewardsHistoryError) {
    console.warn(usersRewardsHistoryError)
  }

  return (
    <PromotionList>
      {promotions.map((promotion) => {
        const usersClaimedPromotionHistory = usersRewardsHistory?.claimedPromotions?.find(
          (claimedPromotion) => claimedPromotion.promotionId === promotion.id
        )

        return (
          <PromotionRow
            key={`pcard-${chainId}-${promotion.id}`}
            promotion={promotion}
            chainId={chainId}
            usersClaimedPromotionHistory={usersClaimedPromotionHistory}
            refetchUsersRewardsHistory={refetchUsersRewardsHistory}
          />
        )
      })}
    </PromotionList>
  )
}

// PREDICTION / ESTIMATE:
// (user twab balance for epoch / twab total supply for epoch) * tokensPerEpoch
//
// my twab: 200 for epoch 1
// twab total supply (currently for 1 chain): 1000 for epoch 1
//
// 200/1000 (or 20%) is my vApr
// 30 tokens given away for epoch 1
// = I get 6 tokens for epoch 1
//
// remaining epochs: 8
// 6 * 8 = 48
// I'll get 48 tokens over the entire time (if nothing changes)
const PromotionRow = (props) => {
  const { promotion, chainId, refetchUsersRewardsHistory } = props
  const { id, maxCompletedEpochId, token: tokenAddress } = promotion

  const [isOpen, setIsOpen] = useState(false)

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
  const totalUsd = estimateUsd + claimableUsd

  const refetch = () => {
    refetchUsersRewardsHistory()
    refetchUsersRewardsAmount()
    refetchEstimate()
    refetchClaimable()
  }

  return (
    <>
      {!tokenIsFetched ? (
        <RewardsCardLoadingList listItems={1} />
      ) : (
        <>
          <PromotionListItem
            onClick={() => {
              setIsOpen(true)
            }}
            left={
              <div className='flex items-center font-bold'>
                <img className='w-5 mr-2' src='beach-with-umbrella.png' /> {token.symbol}{' '}
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
                <ClaimableBalance claimableUsd={claimableUsd} isFetched={claimableIsFetched} />{' '}
                <FeatherIcon icon='chevron-right' className='my-auto w-6 h-6 opacity-50' />
              </div>
            }
          />

          <ClaimModal
            {...props}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            claimableAmount={claimableAmount}
            claimableUsd={claimableUsd}
            estimateAmount={estimateAmount}
            estimateUsd={estimateUsd}
            token={token}
            total={total}
            totalUsd={totalUsd}
            refetch={refetch}
            usersPromotionData={usersPromotionData}
          />
        </>
      )}
    </>
  )
}

const ClaimModal = (props) => {
  const { isOpen, setIsOpen } = props

  const [modalState, setModalState] = useState(ClaimModalState.FORM)

  const [txId, setTxId] = useState<string>()
  const transaction = useTransaction(txId)
  const transactionPending = transaction?.state === TransactionState.pending

  const setFormView = () => {
    setModalState(ClaimModalState.FORM)
  }

  const setReceiptView = () => {
    setModalState(ClaimModalState.RECEIPT)
  }

  const onDismiss = () => {
    setFormView()
    setIsOpen(false)
  }

  // // TODO: Contract links
  // const contractLinks: ContractLink[] = [
  //   {
  //     i18nKey: 'prizePool',
  //     chainId,
  //     address: '0xface'
  //   }
  // ]

  let content
  if (modalState === ClaimModalState.FORM) {
    content = (
      <ClaimModalForm
        {...props}
        transactionPending={transactionPending}
        setReceiptView={setReceiptView}
        setTxId={setTxId}
      />
    )
  } else if (modalState === ClaimModalState.RECEIPT) {
    content = (
      <ClaimModalReceipt
        {...props}
        onDismiss={onDismiss}
        transactionPending={transactionPending}
        tx={transaction}
        setFormView={setFormView}
      />
    )
  }

  return (
    <BottomSheet
      className='flex flex-col'
      open={isOpen}
      onDismiss={onDismiss}
      label='Claim modal'
      snapPoints={snapTo90}
    >
      {content}
    </BottomSheet>
  )
}

const ClaimModalForm = (props) => {
  const {
    chainId,
    refetch,
    claimableAmount,
    claimableUsd,
    estimateAmount,
    estimateUsd,
    promotion,
    transactionPending,
    token,
    usersClaimedPromotionHistory,
    setReceiptView,
    setTxId
  } = props

  const { t } = useTranslation()

  const { decimals, symbol } = token
  const tokenSymbol = symbol

  const { value, unit } = useNextRewardIn(promotion)

  // const { estimateRows, estimateRowsReversed } = useEstimateRows(promotion, estimateAmount)

  const amount = getAmountFromBigNumber(usersClaimedPromotionHistory?.rewards, decimals)

  console.log(promotion)
  const vapr = usePromotionVAPR(promotion, decimals)

  return (
    <>
      <RewardsEndInBanner {...props} />

      <div className='flex items-center text-lg xs:mt-4 mb-2'>
        <span className='font-bold'>{t('unclaimedRewards', 'Unclaimed rewards')}</span>
        <span className='ml-1 opacity-50'>
          {claimableUsd || claimableUsd === 0 ? (
            <>(${numberWithCommas(claimableUsd)})</>
          ) : (
            <ThemedClipSpinner sizeClassName='w-4 h-4' />
          )}
        </span>
      </div>
      <div className='flex items-center space-x-4'>
        <UnitPanel label={t('earning', 'Earning', { tokenSymbol })} chainId={chainId} vapr={vapr} />
        {/* <UnitPanel
          label={t('unclaimedToken', 'Unclaimed {{tokenSymbol}}', { tokenSymbol })}
          chainId={chainId}
          icon={<TokenIcon chainId={chainId} address={token?.address} sizeClassName='w-4 h-4' />}
          token={token}
          amount={claimableAmount}
          unit={token.symbol}
        /> */}

        <UnitPanel
          label={t('nextReward', 'Next Reward')}
          chainId={chainId}
          icon={<span className='mr-1'>🗓️</span>}
          value={value}
          unit={t(unit)}
        />
      </div>

      {/* {estimateRows?.length > 1 ? (
        <div className='bg-pt-purple-lightest dark:bg-white dark:bg-opacity-10 rounded-lg xs:mb-4'>
          <div className='flex flex-row w-full justify-between space-x-2 pt-2 px-4 sm:px-6 text-xxs font-averta-bold opacity-60'>
            {t('amount', 'Amount')}
            <div>{t('awarded', 'Awarded')}</div>
          </div>

          <ul className={classNames('text-inverse max-h-48 overflow-y-auto space-y-1 my-1')}>
            {estimateRowsReversed.map((row) => {
              const { estimateAmount: amount, epoch } = row
              const { epochEndTimestamp } = epoch

              return (
                <RewardRow
                  {...props}
                  isEstimate
                  key={`promotion-${promotion.id}-${epochEndTimestamp}`}
                  promotionId={promotion.id}
                  amount={amount}
                  awardedAt={epochEndTimestamp}
                />
              )
            })}
          </ul>
        </div>
      ) : null} */}

      {amount.amountPretty && (
        <div className='flex items-center bg-pt-purple-lightest dark:bg-white dark:bg-opacity-10 rounded-lg mt-2 xs:mb-4 py-2 px-4 font-averta-bold'>
          <span className='opacity-40 uppercase text-xxs '>{t('claimed', 'Claimed')}: </span>
          <span className='flex items-center'>
            <>
              <TokenIcon
                chainId={chainId}
                address={token?.address}
                sizeClassName='w-4 h-4'
                className='mx-1'
              />{' '}
              {numberWithCommas(amount.amountPretty)} {symbol}
            </>
          </span>
        </div>
      )}

      <SubmitTransactionButton
        {...props}
        setReceiptView={setReceiptView}
        claimableAmount={claimableAmount}
        token={token}
        claimableUsd={claimableUsd}
        chainId={chainId}
        promotion={promotion}
        transactionPending={transactionPending}
        setTxId={setTxId}
        refetch={refetch}
      />
    </>
  )
}

// const RewardRow = (props) => {
//   const { isEstimate, chainId, token, amount, date, awardedAt, promotionId } = props

//   const { t } = useTranslation()

//   const awardedAtShort = format(new Date(sToMs(awardedAt)), 'MMM do yyyy')
//   const awardedAtLong = format(new Date(sToMs(awardedAt)), 'MMMM do yyyy @ h:mm:ss a')

//   return (
//     <li className={classNames('flex flex-row text-center rounded-lg text-xxs xs:text-xs')}>
//       <div
//         className={classNames(
//           'flex rounded-lg flex-row w-full justify-between space-x-2 px-2 sm:px-4 py-1 hover:bg-pt-purple-darkest hover:bg-opacity-10 mx-2'
//         )}
//       >
//         <span className='flex items-center font-averta-bold'>
//           {isEstimate ? (
//             <div>
//               ⏳ {numberWithCommas(amount)}{' '}
//               <span className='uppercase opacity-50'>
//                 {token.symbol} ({t('estimateAbbreviation', 'est')})
//               </span>
//             </div>
//           ) : (
//             <>
//               <TokenIcon
//                 chainId={chainId}
//                 address={token?.address}
//                 sizeClassName='w-4 h-4'
//                 className='mr-1'
//               />
//               {numberWithCommas(amount)} <span className='opacity-50 ml-1'>{token.symbol}</span>
//             </>
//           )}
//         </span>
//         <div>
//           <Tooltip id={`tooltip-promotion-${promotionId}-epoch-${awardedAt}`} tip={awardedAtLong}>
//             <span className='font-bold opacity-50'>{awardedAtShort}</span>
//           </Tooltip>
//         </div>
//       </div>
//     </li>
//   )
// }

const RewardsEndInBanner = (props) => {
  const { chainId, token, promotion } = props
  const { t } = useTranslation()

  const [days, sentence] = useRewardsEndInSentence(promotion, token)
  const hasEnded = days <= 0

  return (
    <div
      className='w-full flex rounded-lg my-4 font-bold shadow-sm'
      style={{
        backgroundImage: hasEnded
          ? `linear-gradient(300deg, #CC3A48 0%, #AC0A48 100%)`
          : `linear-gradient(300deg, #7617fA 0%, #CE66FF 100%)`
      }}
    >
      <div
        className={classNames(
          'flex flex-col xs:flex-row items-center justify-center w-full text-center text-white rounded-lg p-3',
          {
            'bg-white bg-opacity-10': days > 0
          }
        )}
      >
        <TokenIcon
          chainId={chainId}
          address={token?.address}
          sizeClassName='w-5 h-5 xs:w-4 xs:h-4'
          className='mr-1'
        />
        {sentence}

        {days > 1 && (
          <Link href={{ pathname: '/deposit' }}>
            <a className='uppercase hover:underline transition ml-2 text-pt-teal text-xs font-averta-bold'>
              {t('depositMore', 'Deposit more')}
            </a>
          </Link>
        )}
      </div>
    </div>
  )
}

const useRewardsEndInSentence = (promotion, token) => {
  const { t } = useTranslation()

  const tokenSymbol = token.symbol
  const daysRemaining = usePromotionDaysRemaining(promotion)

  let rewardsEndInSentence =
    daysRemaining < 0
      ? t('tokenRewardsHaveEnded', '{{tokenSymbol}} have ended', { tokenSymbol })
      : t('tokenRewardsEndSoon', '{{tokenSymbol}} rewards ending soon!', { tokenSymbol })

  if (daysRemaining > 1) {
    rewardsEndInSentence = t(
      'tokenRewardsEndInNDays',
      '{{tokenSymbol}} rewards end in {{days}} days',
      {
        tokenSymbol,
        days: Math.round(daysRemaining)
      }
    )
  }

  return [daysRemaining, rewardsEndInSentence]
}

interface ClaimModalReceiptProps {
  chainId: number
  token: Token
  claimableUsd: number
  tx: Transaction
  transactionPending: boolean
}

const ClaimModalReceipt: React.FC<ClaimModalReceiptProps> = (props) => {
  const { chainId, token, claimableUsd, tx, transactionPending } = props
  const { t } = useTranslation()

  const [cachedClaimableUsd] = useState(claimableUsd)

  const label = transactionPending ? t('claiming', 'Claiming') : t('claimed', 'Claimed!')

  const icon = transactionPending ? (
    <ThemedClipSpinner sizeClassName='w-4 h-4 xs:w-6 xs:h-6' className='mr-2 opacity-50' />
  ) : (
    <span className='mr-2'>👍</span>
  )

  return (
    <>
      <div className='flex flex-grow flex-col justify-between'>
        <div>
          <BottomSheetTitle
            title={
              <>
                <div className='flex flex-col items-center justify-center max-w-xs mx-auto leading-tight'>
                  <PrizeWLaurels className='flex justify-center mx-auto my-4 w-16 xs:w-32' />
                  {t('rewardsClaimSubmitted', 'Rewards claim submitted, confirming transaction.')}
                </div>
              </>
            }
          />

          <div className='flex items-center justify-center w-full bg-white dark:bg-actually-black dark:bg-opacity-10 rounded-xl p-6 my-4 xs:my-8 xs:text-xl font-bold'>
            <span className='mx-auto flex items-center mt-1'>
              {icon}
              <span className='opacity-70 font-bold ml-1 mr-2'>{label}</span>
              <TokenIcon
                chainId={chainId}
                address={token?.address}
                sizeClassName='w-4 h-4 xs:w-6 xs:h-6'
              />{' '}
              <span className='mx-1'>{numberWithCommas(cachedClaimableUsd)}</span>
              <span>{token.symbol}</span>
            </span>
          </div>
        </div>

        <div className='space-y-4'>
          <AccountPageButton {...props} />
          <TransactionReceiptButton className='w-full' chainId={chainId} tx={tx} />
        </div>
      </div>
    </>
  )
}

export const AccountPageButton = (props) => {
  const { onDismiss } = props
  const { t } = useTranslation()

  return (
    <SquareLink
      size={SquareButtonSize.md}
      theme={SquareButtonTheme.teal}
      className='w-full text-center'
      onClick={onDismiss}
    >
      {t('viewAccount', 'View account')}
    </SquareLink>
  )
}

const UnitPanel = (props) => {
  const { label, amount, icon, unit, value, vapr } = props

  return (
    <div className='flex flex-col bg-white dark:bg-actually-black dark:bg-opacity-20 bg-pt-purple-lightest rounded-lg w-full pt-2 pb-3 mb-4 font-averta-bold'>
      <span className='mx-auto flex items-center mt-1'>
        {icon}

        {(value || amount) && (
          <span className='mx-1'>
            {value && numberWithCommas(value)}
            {amount && numberWithCommas(amount?.amount)}
          </span>
        )}

        {unit && <span className='uppercase'>{unit}</span>}

        {vapr && (
          <>
            <span className='mr-1'>{displayPercentage(String(vapr))}%</span> <VAPRTooltip />
          </>
        )}
      </span>
      <div className='uppercase text-xxxs text-center mt-1 opacity-40'>{label}</div>
    </div>
  )
}

const ClaimableBalance = (props) => {
  const { isFetched, claimableUsd } = props

  return (
    <div
      className={classNames('flex items-center leading-none font-bold mr-3', {
        'opacity-50': claimableUsd <= 0
      })}
    >
      {isFetched ? (
        <>${numberWithCommas(claimableUsd)}</>
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
  usersClaimedPromotionHistory: ClaimedPromotion
  setReceiptView: () => void
  setTxId: (id: string) => void
  refetch: () => void
}

/**
 * @param props
 */
const SubmitTransactionButton: React.FC<SubmitTransactionButtonProps> = (props) => {
  const {
    chainId,
    promotion,
    token,
    transactionPending,
    claimableAmount,
    setReceiptView,
    setTxId,
    refetch,
    usersClaimedPromotionHistory
  } = props

  const { id: promotionId, maxCompletedEpochId } = promotion
  const usersAddress = useUsersAddress()

  const isWalletOnProperNetwork = useIsWalletOnChainId(chainId)

  const { data: signer } = useSigner()
  const { t } = useTranslation()

  const sendTransaction = useSendTransaction()

  const sendClaimTx = async () => {
    const epochIds = [...Array(maxCompletedEpochId).keys()].filter(
      (completedEpochId) =>
        !usersClaimedPromotionHistory?.epochs.includes(completedEpochId.toString())
    )

    const twabRewardsContract = getTwabRewardsContract(chainId, signer)

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
          refetch()
        }
      }
    })
    setTxId(transactionId)
  }

  const disabled =
    !signer || transactionPending || !claimableAmount || Number(claimableAmount?.amount) === 0

  const theme =
    isWalletOnProperNetwork && !disabled ? SquareButtonTheme.rainbow : SquareButtonTheme.teal

  return (
    <TxButton
      chainId={chainId}
      disabled={disabled}
      onClick={sendClaimTx}
      className='mt-2 flex w-full items-center justify-center'
      theme={theme}
    >
      <span className='font-averta-bold'>
        {t('claim', 'Claim')} {numberWithCommas(claimableAmount?.amount)} {token.symbol}
      </span>
    </TxButton>
  )
}
