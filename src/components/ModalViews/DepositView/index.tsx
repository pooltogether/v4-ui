import { ExpectedPrizeBreakdown } from '@components/ModalViews/DepositView/ExpectedPrizeBreakdown'
import {
  TokenAmountFormValues,
  TokenAmountInputFormView
} from '@components/ModalViews/TokenAmountInputFormView'
import { useDepositValidationRules } from '@hooks/v4/PrizePool/useDepositValidationRules'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { Amount } from '@pooltogether/hooks'
import { ViewProps } from '@pooltogether/react-components'
import { getAmount } from '@pooltogether/utilities'
import { Transaction } from '@pooltogether/wallet-connection'
import { DepositInfoBox } from './DepositInfoBox'

/**
 * Handles passing default values to the TokenAmountInputFormView for depositing into V4 prize pools.
 * @param props
 * @returns
 */
export const DepositView: React.FC<
  {
    depositAmount: Amount
    setDepositAmount: (amount: Amount) => void
    transaction?: Transaction
    formKey: string
    connectWallet?: () => void
    onSubmit?: () => void
  } & ViewProps
> = (props) => {
  const {
    depositAmount,
    setDepositAmount,
    transaction,
    formKey,
    connectWallet,
    onSubmit,
    ...remainingProps
  } = props
  const prizePool = useSelectedPrizePool()
  const { data: tokens } = useSelectedPrizePoolTokens()

  const useValidationRules = () => useDepositValidationRules(prizePool)

  return (
    <TokenAmountInputFormView
      {...remainingProps}
      submitButtonContent='Review Deposit'
      formKey={formKey}
      connectWallet={connectWallet}
      useValidationRules={useValidationRules}
      handleSubmit={(values: TokenAmountFormValues) => {
        setDepositAmount(getAmount(values[formKey], tokens?.token.decimals))
        onSubmit?.()
      }}
      carouselChildren={[
        <DepositInfoBox
          key='deposit-info-box'
          formKey={formKey}
          transaction={transaction}
          bgClassName='bg-white bg-opacity-100 dark:bg-actually-black dark:bg-opacity-10 transition-opacity'
          errorBgClassName='bg-white bg-opacity-50 dark:bg-actually-black dark:bg-opacity-30 transition-opacity'
        />,

        <ExpectedPrizeBreakdown key='prize-breakdown' formKey={formKey} className='mx-auto' />
      ]}
      chainId={prizePool.chainId}
      token={tokens?.token}
      defaultValue={depositAmount?.amount}
    />
  )
}
