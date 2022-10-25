import { AmountBeingSwapped } from '@components/AmountBeingSwapped'
import { AnimatedBorderCard } from '@components/AnimatedCard'
import { ModalInfoList } from '@components/InfoList'
import { EstimatedDepositGasItems } from '@components/InfoList/EstimatedGasItem'
import { PrizePoolNetworkAPRItem } from '@components/InfoList/PrizePoolNetworkAPRItem'
import { TwabRewardsAprItem } from '@components/InfoList/TwabRewardsAprItem'
import { UpdatedPrizePoolOddsListItem } from '@components/InfoList/UpdatedPrizePoolOddsListItem'
import {
  ReviewTransactionView,
  ReviewTransactionViewProps
} from '@components/ModalViews/ReviewTransactionView'
import { TwitterIntentButton } from '@components/TwitterIntentButton'
import { EstimateAction } from '@constants/odds'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { usePrizePoolTicketDecimals } from '@hooks/v4/PrizePool/usePrizePoolTicketDecimals'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useSelectedPrizePoolTicket } from '@hooks/v4/PrizePool/useSelectedPrizePoolTicket'
import { usePrizePoolNetworkTicketTotalSupply } from '@hooks/v4/PrizePoolNetwork/usePrizePoolNetworkTicketTotalSupply'
import { useTotalExpectedNumberOfPrizes } from '@hooks/v4/PrizePoolNetwork/useTotalExpectedNumberOfPrizes'
import { Amount } from '@pooltogether/hooks'
import { ButtonLink, ButtonSize, ButtonTheme, Button } from '@pooltogether/react-components'
import {
  formatCurrencyNumberForDisplay,
  formatUnformattedBigNumberForDisplay,
  msToS,
  numberWithCommas
} from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { Transaction, useIsWalletMetamask, useWalletChainId } from '@pooltogether/wallet-connection'
import { addDays } from '@utils/date'
import { getTimestampString } from '@utils/getTimestampString'
import { DepositLowAmountWarning } from '@views/DepositLowAmountWarning'
import { BigNumber } from 'ethers'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Generic deposit review
 * @param props
 * @returns
 */
export const DepositReviewView: React.FC<
  {
    reviewView?: React.ReactNode
    successView?: React.ReactNode
    depositAmount: Amount
    depositTransaction: Transaction
    sendDepositTransaction: () => void
    clearDepositTransaction: () => void
  } & ReviewTransactionViewProps
> = (props) => {
  const {
    reviewView,
    successView,
    depositAmount,
    depositTransaction,
    sendDepositTransaction,
    clearDepositTransaction,
    ...reviewViewProps
  } = props

  const prizePool = useSelectedPrizePool()
  const { data: tokenData } = usePrizePoolTokens(prizePool)

  return (
    <ReviewTransactionView
      {...reviewViewProps}
      amount={depositAmount}
      transaction={depositTransaction}
      sendTransaction={sendDepositTransaction}
      clearTransaction={clearDepositTransaction}
      spenderAddress={prizePool.address}
      tokenAddress={tokenData?.token.address}
      reviewView={
        <div className='flex flex-col space-y-4'>
          <DepositReviewViewContent depositAmount={depositAmount} />
          {reviewView}
        </div>
      }
      successView={
        <div className='flex flex-col space-y-4'>
          <CheckBackForPrizesBox />
          <TweetAboutDeposit
            amountUnformatted={depositAmount?.amountUnformatted}
            prizePool={prizePool}
          />
          <AccountPageButton />
          <AddTicketToWallet />
          {successView}
        </div>
      }
    />
  )
}

const DepositReviewViewContent: React.FC<{ depositAmount: Amount }> = (props) => {
  const { depositAmount } = props
  const { t } = useTranslation()
  const { chainId } = useSelectedChainId()
  const prizePool = useSelectedPrizePool()
  const { data: tokenData } = usePrizePoolTokens(prizePool)

  return (
    <div className='flex flex-col space-y-8'>
      <p className='text-center text-xs'>
        <Trans
          i18nKey='checkDailyForMoreInfoSeeHere'
          components={{
            a: (
              <a
                href='https://docs.pooltogether.com/faq/prizes-and-winning'
                target='_blank'
                rel='noopener noreferrer'
                className='text-highlight-1 hover:opacity-70 transition-opacity'
              />
            )
          }}
        />
      </p>
      <AmountBeingSwapped
        title={t('depositTicker', { ticker: tokenData.token.symbol })}
        chainId={chainId}
        from={tokenData.token}
        to={tokenData.ticket}
        amountFrom={depositAmount}
        amountTo={depositAmount}
      />
      <DepositLowAmountWarning chainId={chainId} amountToDeposit={depositAmount} />
      <ModalInfoList>
        {prizePool && (
          <>
            <UpdatedPrizePoolOddsListItem
              prizePool={prizePool}
              action={EstimateAction.deposit}
              amount={depositAmount}
              nullState={'0'}
              className='w-full'
            />
            <TwabRewardsAprItem />
            <PrizePoolNetworkAPRItem />
          </>
        )}
        <EstimatedDepositGasItems chainId={chainId} />
      </ModalInfoList>
    </div>
  )
}

const CheckBackForPrizesBox = () => {
  const { t } = useTranslation()
  const eligibleDate = getTimestampString(msToS(addDays(new Date(), 2).getTime()))

  return (
    <AnimatedBorderCard className='flex flex-col text-center'>
      <div className='mb-2'>
        {t('disclaimerComeBackRegularlyToClaimWinnings', { date: eligibleDate })}
      </div>

      <a
        href='https://docs.pooltogether.com/welcome/faq#prizes-and-winning'
        target='_blank'
        rel='noopener noreferrer'
        className='underline text-xs'
      >
        {t('learnMore', 'Learn more')}
      </a>
    </AnimatedBorderCard>
  )
}

export const AccountPageButton = () => {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <Link href={{ pathname: '/account', query: router.query }}>
      <ButtonLink
        size={ButtonSize.md}
        theme={ButtonTheme.tealOutline}
        className='w-full text-center'
      >
        {t('viewAccount', 'View account')}
      </ButtonLink>
    </Link>
  )
}

export const AddTicketToWallet = () => {
  const { chainId: selectedChainId } = useSelectedChainId()
  const { data: ticket } = useSelectedPrizePoolTicket()
  const { t } = useTranslation()
  const isMetaMask = useIsWalletMetamask()
  const walletChainId = useWalletChainId()
  const isWalletOnProperNetwork = selectedChainId === walletChainId

  if (!isMetaMask || !isWalletOnProperNetwork) return null

  return (
    <Button theme={ButtonTheme.tealOutline} className='w-full'>
      {t('addTicketTokenToMetamask', {
        token: ticket.symbol
      })}
    </Button>
  )
}

export const TweetAboutDeposit = (props: {
  amountUnformatted: BigNumber
  prizePool: PrizePool
}) => {
  const { amountUnformatted, prizePool } = props
  const { data: decimals, isFetched: isDecimalsFetched } = usePrizePoolTicketDecimals(prizePool)
  const { totalAmountOfPrizes } = useTotalExpectedNumberOfPrizes()
  const { data: totalSupply, isFetched: isTotalSuppluFetched } =
    usePrizePoolNetworkTicketTotalSupply()
  const { t } = useTranslation()

  const isReady = isDecimalsFetched && !!totalAmountOfPrizes && isTotalSuppluFetched

  return (
    <TwitterIntentButton
      disabled={!isReady}
      url='https://app.pooltogether.com'
      text={t('depositTweet', {
        amountDeposited: formatUnformattedBigNumberForDisplay(amountUnformatted, decimals, {
          style: 'currency',
          currency: 'USD'
        }),
        totalAmountDeposited: formatCurrencyNumberForDisplay(
          totalSupply?.totalSupply.amount,
          'usd'
        ),
        totalAmountOfPrizes
      })}
    />
  )
}
