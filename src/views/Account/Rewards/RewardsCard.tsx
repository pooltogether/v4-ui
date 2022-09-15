import { PrizeWLaurels } from '@components/Images/PrizeWithLaurels'
import { TxButton } from '@components/Input/TxButton'
import { LoadingList } from '@components/PrizePoolDepositList/LoadingList'
import { CardTitle } from '@components/Text/CardTitle'
import { TransactionReceiptButton } from '@components/TransactionReceiptButton'
import { TwitterIntentButton } from '@components/TwitterIntentButton'
import { VAPRTooltip } from '@components/VAPRTooltip'
import { TransactionResponse } from '@ethersproject/providers'
import { usePrizePoolByChainId } from '@hooks/v4/PrizePool/usePrizePoolByChainId'
import { useAllChainsFilteredPromotions } from '@hooks/v4/TwabRewards/useAllChainsFilteredPromotions'
import { usePromotionVAPR } from '@hooks/v4/TwabRewards/usePromotionVAPR'
import { useUsersCurrentEpochEstimateAccrued } from '@hooks/v4/TwabRewards/useUsersCurrentEpochEstimateAccrued'
import { useUsersPromotionAmountClaimable } from '@hooks/v4/TwabRewards/useUsersPromotionAmountClaimable'
import { useUsersPromotionAmountEstimate } from '@hooks/v4/TwabRewards/useUsersPromotionAmountEstimate'
import { useUsersPromotionRewardsAmount } from '@hooks/v4/TwabRewards/useUsersPromotionRewardsAmount'
import { useUsersRewardsHistory } from '@hooks/v4/TwabRewards/useUsersRewardsHistory'
import { ClaimedPromotion, Promotion } from '@interfaces/promotions'
import { Token, Amount, useToken, useTokenBalance } from '@pooltogether/hooks'
import {
  BottomSheet,
  BottomSheetTitle,
  snapTo90,
  ThemedClipSpinner,
  NetworkIcon,
  TokenIcon,
  SquareButtonTheme,
  SquareLink,
  SquareButtonSize,
  ExternalLink
} from '@pooltogether/react-components'
import {
  displayPercentage,
  numberWithCommas,
  getNetworkNameAliasByChainId,
  getNetworkNiceNameByChainId,
  sToD
} from '@pooltogether/utilities'
import {
  useSendTransaction,
  useUsersAddress,
  useIsWalletOnChainId,
  TransactionState,
  useTransaction,
  Transaction,
  getChainColorByChainId
} from '@pooltogether/wallet-connection'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { loopXTimes } from '@utils/loopXTimes'
import { getTwabRewardsContract } from '@utils/v4/TwabRewards/getTwabRewardsContract'
import { capitalizeFirstLetter } from '@utils/v4/TwabRewards/misc'
import { getNextRewardIn, getPromotionDaysRemaining } from '@utils/v4/TwabRewards/promotionHooks'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Trans } from 'next-i18next'
import { useTranslation } from 'next-i18next'
import { useSigner } from 'wagmi'

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

  const backgroundColor = getChainColorByChainId(chainId)
  const networkName = capitalizeFirstLetter(getNetworkNameAliasByChainId(chainId))

  return (
    <div
      className='rounded-xl text-white p-4'
      style={{ backgroundColor: backgroundColor, minHeight: 100 }}
    >
      <div className='flex items-center font-bold mb-4'>
        <NetworkIcon
          chainId={chainId}
          className='mr-2 border border-opacity-30 border-white'
          sizeClassName='w-5 h-5'
        />
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

const PromotionRow = (props) => {
  const { promotion, chainId, refetchUsersRewardsHistory } = props
  const { id, maxCompletedEpochId, token: tokenAddress } = promotion

  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)
  const usersAddress = useUsersAddress()

  const { data: token, isFetched: tokenIsFetched } = useTokenBalance(
    chainId,
    usersAddress,
    tokenAddress
  )

  const prizePool = usePrizePoolByChainId(chainId)

  const { data: usersPromotionData, refetch: refetchUsersRewardsAmount } =
    useUsersPromotionRewardsAmount(chainId, Number(id), maxCompletedEpochId, usersAddress)

  const { id: promotionId } = promotion

  const {
    data: claimable,
    isFetched: claimableIsFetched,
    refetch: refetchClaimable
  } = useUsersPromotionAmountClaimable(chainId, promotionId, usersPromotionData, token)
  const { amount: claimableAmount, usd: claimableUsd } = claimable || {}

  const { data: estimate, refetch: refetchEstimate } = useUsersPromotionAmountEstimate(
    chainId,
    promotion,
    token
  )
  const { amount: estimateAmount } = estimate || {}

  const vapr = usePromotionVAPR(promotion)
  // TODO: This might make more sense to check the user's TWAB balance for this chain/prizePool
  // to see if it is 0 or not
  const userIsEarning = estimateAmount?.amountUnformatted?.gt(0)

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
                <img className='w-5 mr-2 hidden xs:block' src='beach-with-umbrella.png' />{' '}
                {token.symbol}{' '}
              </div>
            }
            center={
              <>
                {vapr > 0 && !userIsEarning && (
                  <span className='hidden xs:inline-block mr-1 font-bold'>
                    <span className='mr-1'>{displayPercentage(String(vapr))}%</span> <VAPRTooltip />
                  </span>
                )}

                {vapr > 0 && userIsEarning ? (
                  <div className='flex items-center'>
                    <span className='hidden xs:inline-block mr-1 font-bold'>
                      {t('earningPercentage', 'Earning {{percentage}}%', {
                        percentage: displayPercentage(String(vapr))
                      })}
                    </span>

                    <span className='xs:hidden mr-1 font-bold'>
                      {displayPercentage(String(vapr))}%
                    </span>
                  </div>
                ) : null}
              </>
            }
            right={
              <div className='flex items-center'>
                <TokenIcon
                  chainId={chainId}
                  address={token?.address}
                  sizeClassName='w-4 h-4 xs:w-5 xs:h-5'
                  className='mr-1 xs:mr-2'
                />
                <BalanceDisplay
                  prizePool={prizePool}
                  promotion={promotion}
                  estimateAmount={estimateAmount}
                  claimableAmount={claimableAmount}
                  claimableIsFetched={claimableIsFetched}
                />{' '}
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
            token={token}
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

  const { value, unit, seconds } = getNextRewardIn(promotion)

  const amount = getAmountFromBigNumber(usersClaimedPromotionHistory?.rewards, decimals)

  const vapr = usePromotionVAPR(promotion)

  // TODO: This might make more sense to check the user's TWAB balance for this chain/prizePool
  // to see if it is 0 or not
  const userIsEarning = estimateAmount?.amountUnformatted?.gt(0)
  const userNeedsToDeposit = !userIsEarning && claimableAmount?.amountUnformatted.isZero()

  return (
    <>
      <RewardsEndInBanner {...props} />

      {userNeedsToDeposit ? (
        <>
          <div className='flex flex-col xs:mt-4 mb-2'>
            <div className='font-bold text-lg'>
              {t('depositToEarnRewards', 'Deposit to earn rewards')}
            </div>
            <div>
              <Trans
                i18nKey='depositNowOnChainToEarnXVapr'
                defaults='Deposit now on {{networkName}} to earn <vapr />'
                values={{
                  networkName: getNetworkNiceNameByChainId(chainId)
                }}
                components={{
                  vapr: <VAPRWithTooltip vapr={vapr} />
                }}
              />
            </div>

            <SquareLink
              href='/deposit'
              theme={SquareButtonTheme.rainbow}
              className='mt-4 mb-8 flex w-full items-center justify-center'
            >
              {userIsEarning ? t('depositMore', 'Deposit more') : t('deposit', 'Deposit')}
            </SquareLink>
          </div>
        </>
      ) : (
        <>
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
            <UnitPanel
              label={t('earning', 'Earning', { tokenSymbol })}
              chainId={chainId}
              vapr={vapr}
            />

            {promotion.epochDuration >= seconds ? (
              <UnitPanel
                label={
                  promotion.currentEpochId === promotion.numberOfEpochs
                    ? 'Rewards end in'
                    : t('nextReward', 'Next Reward')
                }
                chainId={chainId}
                icon={<span className='mr-1'>🗓️</span>}
                value={value}
                unit={t(unit)}
              />
            ) : (
              <UnitPanel
                label={'Rewards start in'}
                chainId={chainId}
                icon={<span className='mr-1'>🗓️</span>}
                value={sToD(seconds - promotion.epochDuration)}
                unit={t(unit)}
              />
            )}
          </div>
        </>
      )}

      {amount.amountPretty && (
        <div className='flex items-center bg-pt-purple-lightest dark:bg-white dark:bg-opacity-10 rounded-lg mt-2 mb-4 py-2 px-4 font-bold'>
          <span className='opacity-40 uppercase text-xxs '>{t('claimed', 'Claimed')}: </span>
          <span className='flex items-center'>
            <>
              <TokenIcon
                chainId={chainId}
                address={token?.address}
                sizeClassName='w-4 h-4'
                className='mx-1'
              />
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

const VAPRWithTooltip = (props) => {
  const { vapr } = props

  return (
    <span className='font-bold'>
      {displayPercentage(String(vapr))}% <VAPRTooltip />
    </span>
  )
}

const RewardsEndInBanner = (props) => {
  const { chainId, token, estimateAmount, promotion } = props
  const { t } = useTranslation()

  const [days, sentence] = useRewardsEndInSentence(promotion, token)
  const hasEnded = days <= 0

  // TODO: This might make more sense to check the user's TWAB balance for this chain/prizePool
  // to see if it is 0 or not
  const userIsEarning = estimateAmount?.amountUnformatted?.gt(0)

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
            <a className='uppercase hover:underline transition ml-2 text-pt-teal text-xs font-bold'>
              {userIsEarning ? t('depositMore', 'Deposit more') : t('deposit', 'Deposit')}
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
  const daysRemaining = getPromotionDaysRemaining(promotion)

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
  claimableAmount: Amount
  claimableUsd: number
  tx: Transaction
  transactionPending: boolean
}

const ClaimModalReceipt: React.FC<ClaimModalReceiptProps> = (props) => {
  const { chainId, token, claimableUsd, claimableAmount, tx, transactionPending } = props
  const { t } = useTranslation()

  const [cachedClaimableUsd] = useState(claimableUsd)
  const [cachedClaimableAmount] = useState(claimableAmount)

  const label = transactionPending ? t('claiming', 'Claiming') : t('claimed', 'Claimed!')

  const icon = transactionPending ? (
    <ThemedClipSpinner sizeClassName='w-4 h-4 xs:w-6 xs:h-6' className='mr-2 opacity-50' />
  ) : (
    <span className='mr-2'>👍</span>
  )

  const isOPToken = token.symbol === 'OP'

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
              <span className='opacity-70 font-bold mr-2'>{label}</span>
              <TokenIcon
                chainId={chainId}
                address={token?.address}
                sizeClassName='w-4 h-4 xs:w-6 xs:h-6'
                className='ml-2 mr-1'
              />{' '}
              <span className='mx-1'>{numberWithCommas(cachedClaimableAmount.amountPretty)}</span>
              <span>{token.symbol}</span>
            </span>
          </div>
        </div>

        {isOPToken && <OPTokenCTAs />}

        <div className='space-y-4'>
          {!isOPToken && <AccountPageButton {...props} />}
          <TransactionReceiptButton className='w-full' chainId={chainId} tx={tx} />
          <TwitterIntentButton
            url='https://app.pooltogether.com'
            text={`I just claimed $${numberWithCommas(
              cachedClaimableUsd
            )} in rewards from my @pooltogether_ deposit! Join me in saving and winning: `}
          />
        </div>
      </div>
    </>
  )
}

const OPTokenCTAs = (props) => {
  const { t } = useTranslation()

  return (
    <>
      <div className='mb-8 px-4 py-8 rounded-lg text-center' style={{ backgroundColor: '#D72B1D' }}>
        <p className='text-xl' style={{ textShadow: 'rgb(170,4,4) 0 0 10px' }}>
          🗳
        </p>

        <p>Learn about voting and delegate the voting power of your OP now:</p>
        <DelegateOPButton />
      </div>
    </>
  )
}

export const DelegateOPButton = (props) => {
  const { t } = useTranslation()

  return (
    <ExternalLink href='https://app.optimism.io/delegates' className='w-full text-center mt-2'>
      {t('delegateOp', 'Delegate OP')}
    </ExternalLink>
  )
}

export const AccountPageButton = (props) => {
  const { onDismiss } = props
  const { t } = useTranslation()

  return (
    <SquareLink
      size={SquareButtonSize.md}
      theme={SquareButtonTheme.tealOutline}
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
    <div className='flex flex-col dark:bg-actually-black dark:bg-opacity-20 bg-pt-purple-lightest rounded-lg w-full pt-2 pb-3 mb-4 font-bold'>
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
        {vapr === 0 && '%'}
      </span>
      <div className='uppercase text-xxxs text-center mt-1 opacity-40'>{label}</div>
    </div>
  )
}

const BalanceDisplay = (props) => {
  const { prizePool, claimableAmount, promotion } = props

  const currentEpochEstimateAccrued = useUsersCurrentEpochEstimateAccrued(prizePool, promotion)

  const balance = useMemo(() => {
    if (
      (!claimableAmount && currentEpochEstimateAccrued === null) ||
      currentEpochEstimateAccrued < 0 ||
      !claimableAmount
    ) {
      return null
    }
    return numberWithCommas(Number(claimableAmount.amount) + currentEpochEstimateAccrued)
  }, [claimableAmount, currentEpochEstimateAccrued])

  if (!claimableAmount && currentEpochEstimateAccrued === null) {
    return <ThemedClipSpinner sizeClassName='w-4 h-4' className='opacity-70' />
  }

  return (
    <div
      className={classNames('flex items-center leading-none font-bold mr-1', {
        'opacity-50': balance === '0' || !balance
      })}
    >
      {balance || 0}
    </div>
  )
}

interface PromotionListItemProps {
  left: React.ReactNode
  right: React.ReactNode
  center?: React.ReactNode
  onClick: () => void
}

const PromotionListItem = (props: PromotionListItemProps) => {
  const { onClick, left, center, right } = props

  return (
    <li className='transition bg-white bg-opacity-20 hover:bg-opacity-30 dark:bg-actually-black dark:bg-opacity-10 dark:hover:bg-opacity-20 rounded-lg'>
      <button className='px-4 py-2 w-full flex justify-between items-center' onClick={onClick}>
        {left}
        {center}
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
    const epochIds = Array.from(Array(maxCompletedEpochId).keys()).filter(
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
      <span className='font-bold'>
        {t('claim', 'Claim')} {numberWithCommas(claimableAmount?.amount)} {token.symbol}
      </span>
    </TxButton>
  )
}
