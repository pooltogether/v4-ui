import { DepositView as DepositViewCore } from '@components/ModalViews/DepositView'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { Amount } from '@pooltogether/hooks'
import { ViewProps } from '@pooltogether/react-components'
import { Transaction } from '@pooltogether/wallet-connection'
import { ViewIds } from '.'

const FORM_KEY = 'depositAmount'

export const DepositView: React.FC<
  {
    depositAmount: Amount
    setDepositAmount: (amount: Amount) => void
    depositTransaction?: Transaction
  } & ViewProps
> = (props) => {
  const {
    depositAmount,
    setDepositAmount,
    depositTransaction,
    setSelectedViewId,
    ...remainingProps
  } = props
  const prizePool = useSelectedPrizePool()
  const { data: tokens } = useSelectedPrizePoolTokens()

  return (
    <DepositViewCore
      {...remainingProps}
      depositAmount={depositAmount}
      formKey={FORM_KEY}
      setSelectedViewId={setSelectedViewId}
      onSubmit={() => setSelectedViewId(ViewIds.reviewTransaction)}
      chainId={prizePool.chainId}
      token={tokens?.token}
      defaultValue={depositAmount?.amount}
      setDepositAmount={setDepositAmount}
    />
  )
}
