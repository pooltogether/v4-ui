import { AmountBeingSwapped } from '@components/AmountBeingSwapped'
import { InfoListItem, ModalInfoList } from '@components/InfoList'
import { EstimatedWithdrawalGasItem } from '@components/InfoList/EstimatedGasItem'
import {
  ReviewTransactionView,
  ReviewTransactionViewProps
} from '@components/ModalViews/ReviewTransactionView'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useUsersPrizePoolBalances } from '@hooks/v4/PrizePool/useUsersPrizePoolBalances'
import { Amount, TokenWithBalance } from '@pooltogether/hooks'
import { Tooltip } from '@pooltogether/react-components'
import { getMaxPrecision, numberWithCommas } from '@pooltogether/utilities'
import { Transaction, useUsersAddress } from '@pooltogether/wallet-connection'
import { ethers } from 'ethers'
import { useTranslation } from 'react-i18next'

export const WithdrawReviewView: React.FC<
  {
    reviewView?: React.ReactNode
    successView?: React.ReactNode
    withdrawAmount: Amount
    withdrawTransaction: Transaction
    sendWithdrawTransaction: () => void
    clearWithdrawTransaction: () => void
  } & ReviewTransactionViewProps
> = (props) => {
  const {
    reviewView,
    successView,
    withdrawAmount,
    withdrawTransaction,
    sendWithdrawTransaction,
    clearWithdrawTransaction,
    ...reviewViewProps
  } = props

  const prizePool = useSelectedPrizePool()
  const { data: tokenData } = usePrizePoolTokens(prizePool)

  return (
    // TODO: Pass theme
    <ReviewTransactionView
      {...reviewViewProps}
      amount={withdrawAmount}
      transaction={withdrawTransaction}
      sendTransaction={sendWithdrawTransaction}
      clearTransaction={clearWithdrawTransaction}
      spenderAddress={prizePool.address}
      tokenAddress={tokenData?.token.address}
      reviewView={
        <div className='flex flex-col space-y-4'>
          <WithdrawReviewViewContent withdrawAmount={withdrawAmount} />
          {reviewView}
        </div>
      }
      successView={<div className='flex flex-col space-y-4'>{successView}</div>}
    />
  )
}

const WithdrawReviewViewContent: React.FC<{ withdrawAmount: Amount }> = (props) => {
  const { withdrawAmount } = props
  const { t } = useTranslation()
  const { chainId } = useSelectedChainId()
  const prizePool = useSelectedPrizePool()
  const { data: tokenData } = usePrizePoolTokens(prizePool)
  const usersAddress = useUsersAddress()
  const { data: balances } = useUsersPrizePoolBalances(usersAddress, prizePool)

  return (
    <div className='flex flex-col space-y-8'>
      <AmountBeingSwapped
        title={t('withdrawTicker', { ticker: tokenData.token.symbol })}
        chainId={chainId}
        from={tokenData.token}
        to={tokenData.ticket}
        amountFrom={withdrawAmount}
        amountTo={withdrawAmount}
      />

      <ModalInfoList>
        {/* // TODO: Add back odds */}
        <FinalTicketBalanceStat
          amount={withdrawAmount?.amount}
          ticket={balances?.balances.ticket}
        />
        <UnderlyingReceivedStat amount={withdrawAmount?.amount} token={tokenData.token} />
        <EstimatedWithdrawalGasItem
          chainId={prizePool.chainId}
          amountUnformatted={withdrawAmount?.amountUnformatted}
        />
      </ModalInfoList>
    </div>
  )
}

const FinalTicketBalanceStat = (props: { amount: string; ticket: TokenWithBalance }) => {
  const { amount, ticket } = props
  const { t } = useTranslation()
  const amountUnformatted = ethers.utils.parseUnits(amount, ticket.decimals)
  const finalBalanceUnformatted = ticket.amountUnformatted.sub(amountUnformatted)
  const finalBalance = ethers.utils.formatUnits(finalBalanceUnformatted, ticket.decimals)
  const finalBalancePretty = numberWithCommas(finalBalance)
  const fullFinalBalancePretty = numberWithCommas(finalBalance, {
    precision: getMaxPrecision(finalBalance)
  })

  return (
    <InfoListItem
      label={t('finalDepositBalance', 'Remaining balance')}
      value={
        <Tooltip id='final-ticket-balance' tip={`${fullFinalBalancePretty} ${ticket.symbol}`}>
          <div className='flex flex-wrap justify-end'>
            <span>{finalBalancePretty}</span>
            <span className='ml-1'>{ticket.symbol}</span>
          </div>
        </Tooltip>
      }
    />
  )
}

const UnderlyingReceivedStat = (props) => {
  const { token, amount } = props
  const { t } = useTranslation()

  const amountPretty = numberWithCommas(amount, { precision: getMaxPrecision(amount) })
  const fullFinalBalancePretty = numberWithCommas(amount, {
    precision: getMaxPrecision(amount)
  })

  return (
    <InfoListItem
      label={t('tickerToReceive', { ticker: token.symbol })}
      value={
        <Tooltip
          id={`${token.symbol}-to-receive`}
          tip={`${fullFinalBalancePretty} ${token.symbol}`}
        >
          <div className='flex flex-wrap justify-end'>
            <span>{amountPretty}</span>
            <span className='ml-1'>{token.symbol}</span>
          </div>
        </Tooltip>
      }
    />
  )
}
